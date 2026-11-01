const weekday_Schedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: { name: 'Weekday Schedule', parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 10 * * 1-5' }] } }, position: [0, -120], notes: 'Runs Monday to Friday at 10:00, one hour after the daily run.', notesInFlow: true }
});

const load_Config = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Load Config', parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'name', value: 'Prospection Config' }, returnAll: false, limit: 1 }, position: [220, -20] }
});

const is_Active = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Is Active', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 3 }, conditions: [{ id: 'fa-1', leftValue: expr('{{ $json.active }}'), rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }], combinator: 'and' }, options: {} }, position: [440, -20], notes: 'Kill switch shared with the daily run.', notesInFlow: true }
});

const load_Open_Sequences = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Load Open Sequences', parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'name', value: 'Prospection Prospects' }, matchType: 'anyCondition', filters: { conditions: [{ keyName: 'status', condition: 'eq', keyValue: 'sent' }, { keyName: 'status', condition: 'eq', keyValue: 'followed_up_1' }] }, returnAll: true }, position: [640, -20], notes: 'Prospects whose sequence is still running (first email sent, or first follow-up sent).', notesInFlow: true }
});

const select_Due = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Select Due', parameters: { mode: 'runOnceForAllItems', jsCode: '// J0 email, follow-up 1 at J+3, follow-up 2 four days later (J+7)\nconst dayMs = 86400000;\nconst now = Date.now();\nreturn $input.all()\n  .map(i => i.json)\n  .filter(r => r && r.threadId && r.lastMessageId)\n  .map(r => {\n    const days = (now - new Date(r.lastActionAt).getTime()) / dayMs;\n    if (r.status === \'sent\' && days >= 2.9) return { ...r, rowId: r.id, step: 1 };\n    if (r.status === \'followed_up_1\' && days >= 3.9) return { ...r, rowId: r.id, step: 2 };\n    return null;\n  })\n  .filter(Boolean)\n  .map(json => ({ json }));' }, position: [860, -20], notes: 'Keeps only the prospects whose next follow-up is due today.', notesInFlow: true }
});

const get_Thread = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Get Thread', parameters: { resource: 'thread', operation: 'get', threadId: expr('{{ $json.threadId }}'), simple: true, options: { returnOnlyMessages: true } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'LquVAVB8bNdpx5bk') }, position: [1080, -20], webhookId: '9d65672f-01ae-41b5-8784-e9c2203f3900', notes: 'Reads the Gmail conversation to detect a reply, an opt-out or a bounce before following up.', notesInFlow: true, retryOnFail: true, maxTries: 2, onError: 'continueRegularOutput' }
});

const detect_Reply = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Detect Reply', parameters: { mode: 'runOnceForEachItem', jsCode: 'const r = $(\'Select Due\').item.json;\nconst msgs = Array.isArray($json.messages) ? $json.messages : null;\n// Thread unreadable: never send blindly\nif (!msgs) return { json: { ...r, action: \'skip\' } };\n\nconst isSent = m => (m.labelIds || []).includes(\'SENT\') || (m.labels || []).some(l => l.id === \'SENT\' || l.name === \'SENT\');\nconst inbound = msgs.filter(m => !isSent(m));\nif (inbound.length) {\n  const text = inbound.map(m => `${m.From || m.from || \'\'} ${m.Subject || m.subject || \'\'} ${m.snippet || \'\'}`).join(\' \');\n  const bounced = /mailer-daemon|postmaster|delivery status|undeliver|non remis|echec de la remise|ÃƒÂ©chec de la remise/i.test(text);\n  const optOut = /\\bstop\\b|d[ÃƒÂ©e]sinscri|unsubscribe|ne plus recevoir|retirez|pas int[ÃƒÂ©e]ress/i.test(text);\n  return { json: { ...r, action: \'close\', newStatus: bounced ? \'bounced\' : (optOut ? \'opt_out\' : \'replied\'), reason: String(inbound[0].snippet || \'\').slice(0, 300) } };\n}\nreturn { json: { ...r, action: \'follow_up\' } };' }, position: [1300, -20], notes: 'Any message not sent by you stops the sequence: replied, opt_out (STOP, unsubscribe) or bounced.', notesInFlow: true }
});

const needs_Follow_Up = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Needs Follow Up', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 3 }, conditions: [{ id: 'nf-1', leftValue: expr('{{ $json.action }}'), rightValue: 'follow_up', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' }, options: {} }, position: [1520, -20] }
});

const send_Follow_Up = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Send Follow Up', parameters: { resource: 'message', operation: 'reply', messageId: expr('{{ $json.lastMessageId }}'), emailType: 'text', message: expr('{{ $json.step === 1 ? $json.followUp1 : $json.followUp2 }}'), options: { appendAttribution: false, replyToSenderOnly: false, senderName: expr('{{ $(\'Load Config\').first().json.senderName }}'), ccList: expr('{{ $json.testMode ? $json.sentTo : \'\' }}') } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'LquVAVB8bNdpx5bk') }, position: [1720, -120], webhookId: '384885d8-353a-49d2-8257-187f53ed6da4', notes: 'Replies in the same Gmail thread. In test mode the follow-up is copied to testEmail, since Gmail drops your own address from reply recipients.', notesInFlow: true, retryOnFail: true, maxTries: 2, waitBetweenTries: 5000, onError: 'continueErrorOutput' }
});

const prepare_Follow_Up_Update = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Prepare Follow Up Update', parameters: { mode: 'runOnceForEachItem', jsCode: 'const r = $(\'Detect Reply\').item.json;\n// Gmail returns a message id only when the reply was really sent\nconst ok = Boolean($json.id) && !$json.error;\nreturn { json: {\n  rowId: r.rowId,\n  status: ok ? (r.step === 1 ? \'followed_up_1\' : \'completed\') : \'send_error\',\n  reason: ok ? (r.reason || \'\') : String($json.error?.message || $json.error || \'Gmail n\\\'a pas confirme l\\\'envoi\').slice(0, 500),\n  lastMessageId: $json.id || r.lastMessageId,\n  lastActionAt: new Date().toISOString(),\n  sentCount: (Number(r.sentCount) || 1) + (ok ? 1 : 0)\n} };' }, position: [1940, -200], notes: 'After follow-up 1 the sequence continues; after follow-up 2 it is completed.', notesInFlow: true }
});

const update_Prospect = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Update Prospect', parameters: { resource: 'row', operation: 'update', dataTableId: { __rl: true, mode: 'name', value: 'Prospection Prospects' }, matchType: 'allConditions', filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr('{{ $json.rowId }}') }] }, columns: { mappingMode: 'defineBelow', value: { status: expr('{{ $json.status }}'), reason: expr('{{ $json.reason }}'), lastMessageId: expr('{{ $json.lastMessageId }}'), lastActionAt: expr('{{ $json.lastActionAt }}'), sentCount: expr('{{ $json.sentCount }}') }, matchingColumns: [], schema: [{ id: 'status', displayName: 'status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'reason', displayName: 'reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'lastMessageId', displayName: 'lastMessageId', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'lastActionAt', displayName: 'lastActionAt', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }, { id: 'sentCount', displayName: 'sentCount', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: true }] }, options: {} }, position: [2160, 40], notes: 'Single write point: updates the prospect row by its ID.', notesInFlow: true }
});

const is_Closed = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Is Closed', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 3 }, conditions: [{ id: 'ic-1', leftValue: expr('{{ $json.action }}'), rightValue: 'close', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' }, options: {} }, position: [1720, 160] }
});

const prepare_Close_Update = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Prepare Close Update', parameters: { mode: 'runOnceForEachItem', jsCode: 'return { json: {\n  rowId: $json.rowId,\n  status: $json.newStatus,\n  reason: $json.reason || \'\',\n  lastMessageId: $json.lastMessageId,\n  lastActionAt: new Date().toISOString(),\n  sentCount: Number($json.sentCount) || 1\n} };' }, position: [1940, 160], notes: 'Closes the sequence on reply, opt-out or bounce. These domains are never contacted again.', notesInFlow: true }
});

const manual_Test_Run = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Manual Test Run', position: [0, 60] }
});

const wf = workflow('Php3N99uXUeNun6Q', 'Prospection Follow Ups', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true, description: 'Daily follow-ups: stops the sequence on reply, opt-out or bounce, otherwise sends follow-up 1 at day 3 and follow-up 2 at day 7 in the same Gmail thread.' });

export default wf
  .add(sticky('## Relances (J+3, J+7)\nChaque jour a 10 h : pour chaque sequence ouverte, lecture du fil Gmail.\n- Reponse, STOP ou rebond : sequence close, plus jamais contacte.\n- Sinon : relance 1 a J+3, relance 2 a J+7 (textes ecrits a J0, aucun appel IA ici).\n\nCredential : **Gmail**.', [], { name: 'Sticky Note', color: 2, width: 600, height: 240, position: [0, -400] }))
  .add(weekday_Schedule)
  .to(load_Config)
  .to(is_Active.onTrue(load_Open_Sequences
    .to(select_Due)
    .to(get_Thread)
    .to(detect_Reply)
    .to(needs_Follow_Up.onTrue(send_Follow_Up
      .to(prepare_Follow_Up_Update)
      .to(update_Prospect)).onFalse(is_Closed.onTrue(prepare_Close_Update
        .to(update_Prospect))))))
  .add(manual_Test_Run)
  .to(load_Config)