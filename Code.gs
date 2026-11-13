/**
 * 時段決策系統 — 開會時間搶奪大賽 (20分鐘天課)
 * Google Sheets 後端資料庫 API (Google Apps Script)
 * 綁定之 Google 試算表 ID: 14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA
 * 試算表網址: https://docs.google.com/spreadsheets/d/14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA/edit
 */

const SPREADSHEET_ID = '14aPkJxFY13HbSLrWFiOVGhuJkaDaGzVVjJUwYcKAIGA';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const selSheet = ss.getSheetByName('Selections');
    const cfgSheet = ss.getSheetByName('SystemConfig');

    const selections = {};
    if (selSheet) {
      const data = selSheet.getDataRange().getValues();
      // Row 0 is header: studentId, nickname, constellation, role, cluster, votedSlots, votedSlotLabels, chosenSlot, chosenSlotLabel, backupSlot, d30Roll, finalAssignedSlot, status, timestamp
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const studentId = String(row[0] || '').trim();
        const chosenSlot = String(row[7] || '').trim();
        const backupSlot = String(row[9] || '').trim();
        const d30RollRaw = row[10];
        const tsRaw = row[13];

        if (studentId && chosenSlot && chosenSlot !== 'N/A' && chosenSlot !== '(空白)') {
          selections[studentId] = {
            chosenSlot: chosenSlot,
            backupSlot: backupSlot && backupSlot !== '(空白)' ? backupSlot : '',
            d30Roll: d30RollRaw !== '' && d30RollRaw !== 'N/A' && d30RollRaw !== '(空白)' ? Number(d30RollRaw) : null,
            timestamp: tsRaw ? new Date(tsRaw).getTime() || Date.now() : Date.now()
          };
        }
      }
    }

    let forceRevealThu = false;
    let lastUpdated = Date.now();
    if (cfgSheet) {
      const cfgData = cfgSheet.getDataRange().getValues();
      for (let i = 1; i < cfgData.length; i++) {
        const key = String(cfgData[i][0] || '').trim();
        const val = cfgData[i][1];
        if (key === 'forceRevealThu') {
          forceRevealThu = (val === true || String(val).toUpperCase() === 'TRUE');
        }
      }
    }

    const result = {
      status: 'ok',
      spreadsheetId: SPREADSHEET_ID,
      selections: selections,
      forceRevealThu: forceRevealThu,
      lastUpdated: lastUpdated
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const selSheet = ss.getSheetByName('Selections');
    const cfgSheet = ss.getSheetByName('SystemConfig');

    const selections = body.selections || {};
    const resolvedUserMap = body.resolvedUserMap || {};
    const userFinalSlot = body.userFinalSlot || {};
    const forceRevealThu = Boolean(body.forceRevealThu);
    const nowIso = new Date().toISOString();

    const SLOT_LABELS = {
      'slot_1': '11/16 Mon 19:00~20:00',
      'slot_2': '11/16 Mon 20:00~21:00',
      'slot_3': '11/16 Mon 21:00~22:00',
      'slot_4': '11/16 Mon 22:00~23:00',
      'slot_5': '11/19 Thu 20:00~21:00',
      'slot_6': '11/19 Thu 21:00~22:00',
      'slot_7': '11/19 Thu 22:00~23:00',
      'slot_8': '11/19 Thu 23:00~00:00'
    };

    if (selSheet) {
      const data = selSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const studentId = String(data[i][0] || '').trim();
        const role = String(data[i][3] || '').trim();
        if (role === 'admin') continue;

        const rec = selections[studentId];
        if (rec && rec.chosenSlot) {
          const finalObj = userFinalSlot[studentId] || resolvedUserMap[studentId] || {};
          const finalSlotId = finalObj.slotId || '';
          selSheet.getRange(i + 1, 8).setValue(rec.chosenSlot); // chosenSlot
          selSheet.getRange(i + 1, 9).setValue(SLOT_LABELS[rec.chosenSlot] || rec.chosenSlot); // chosenSlotLabel
          selSheet.getRange(i + 1, 10).setValue(rec.backupSlot || ''); // backupSlot
          selSheet.getRange(i + 1, 11).setValue(rec.d30Roll !== null && rec.d30Roll !== undefined ? rec.d30Roll : ''); // d30Roll
          selSheet.getRange(i + 1, 12).setValue(finalSlotId ? (SLOT_LABELS[finalSlotId] || finalSlotId) : '等待揭曉'); // finalAssignedSlot
          selSheet.getRange(i + 1, 13).setValue('COMPLETED'); // status
          selSheet.getRange(i + 1, 14).setValue(nowIso); // timestamp
        } else {
          selSheet.getRange(i + 1, 8).setValue('');
          selSheet.getRange(i + 1, 9).setValue('');
          selSheet.getRange(i + 1, 10).setValue('');
          selSheet.getRange(i + 1, 11).setValue('');
          selSheet.getRange(i + 1, 12).setValue('');
          selSheet.getRange(i + 1, 13).setValue('PENDING');
          selSheet.getRange(i + 1, 14).setValue('');
        }
      }
    }

    if (cfgSheet) {
      const cfgData = cfgSheet.getDataRange().getValues();
      for (let i = 1; i < cfgData.length; i++) {
        const key = String(cfgData[i][0] || '').trim();
        if (key === 'forceRevealThu') {
          cfgSheet.getRange(i + 1, 2).setValue(forceRevealThu ? 'TRUE' : 'FALSE');
        } else if (key === 'lastUpdated') {
          cfgSheet.getRange(i + 1, 2).setValue(nowIso);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      updatedAt: nowIso
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
