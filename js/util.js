"use strict";

const MMOL_TO_MGDL = 18;

const dir2Char = {
  NONE: `⇼`,
  TripleUp: `⤊`,
  DoubleUp: `⇈`,
  SingleUp: `↑`,
  FortyFiveUp: `↗`,
  Flat: `→`,
  FortyFiveDown: `↘`,
  SingleDown: `↓`,
  DoubleDown: `⇊`,
  TripleDown: `⤋`,
  "NOT COMPUTABLE": `-`,
  "RATE OUT OF RANGE": `⇕`
};

const customAssign = (targetObject, patchObject) => {

  if (patchObject === null) {
    patchObject = ``;
  }

  for (const key of Object.keys(patchObject)) {
    if (key in targetObject) {
      if (typeof patchObject[key] != `object`) {
        if (targetObject[key].type === `checkbox`) {
          targetObject[key].checked = patchObject[key];
        } else {
          targetObject[key].value = patchObject[key];
        }
      } else {
        customAssign(targetObject[key], patchObject[key]);
      }
    }
  }
  return targetObject;
};

const mgdlToMMOL = (mgdl) => {
  return (Math.round((mgdl / MMOL_TO_MGDL) * 10) / 10).toFixed(1);
};

const charToEntity = (char) => {
  return char && char.length && `&#` + char.charCodeAt(0) + `;`;
};

const directionToChar = (direction) => {
  return dir2Char[direction] || `-`;
};

const prepareData = (obj, convert) => {
  const result = {};

  result.last = convert ? mgdlToMMOL(obj.result[0].sgv) : obj.result[0].sgv;
  result.prev = convert ? mgdlToMMOL(obj.result[1].sgv) : obj.result[1].sgv;
  result.direction = charToEntity(directionToChar(obj.result[0].direction));

  const currentTime = new Date();
  result.age = Math.floor((currentTime.getTime() - obj.result[0].srvCreated) / 1000 / 60);

  const delta = Math.round((result.last - result.prev) * 100) / 100;

  if (delta > 0) {
    result.delta = `+` + delta;
  } else if (delta === 0) {
    result.delta = convert ? `+0.0` : `+0`;
  } else {
    result.delta = delta.toString();
  }

  return result;
};

const dialog = await window.electronAPI.dialog;

const alert = (type, title, msg, sync = false) => {
  const data = {
    type: type,
    title: title,
    message: msg.toString(),
    buttons: [`OK`],
    defaultId: 0,
  };

  if (sync) {
    dialog.showMessageBoxSync(data);
  } else {
    dialog.showMessageBox(data);
  }
};

export { prepareData, customAssign, alert };
