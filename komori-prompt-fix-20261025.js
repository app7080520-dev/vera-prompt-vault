(function () {
  'use strict';
  const VERSION = 'vera-komori-photo-fashion-v2026-10-25';
  if (window.__veraKomoriPromptPatch?.version === VERSION) return;
  const previous = window.promptForRecord;
  if (typeof previous !== 'function') {
    console.error('[Komori prompt patch] promptForRecord unavailable; no change applied.');
    return;
  }
  const corrections = [
    ['小森半身正臉_FaceMaster.jpeg', '小森半身正臉_FaceMaster_v2.jpeg'],
    ['小森全身照_BodyMaster.jpeg', '小森全身照_BodyMaster_v3_面部修正版.jpeg'],
    ['小森半身側臉_AngleAux.jpeg', '小森半身側臉_AngleAux_v2.jpeg'],
    ['藍予晴', '林予晴']
  ];
  function photoType(record) {
    if (record?.version === 'V.內著寫真') return 'inner';
    if (record?.version !== 'V.時裝寫真' || !record.o) return '';
    try {
      if (typeof fashionFamilyOf === 'function' && fashionFamilyOf(record.o) === 'inner-outer') return 'layered';
    } catch (_) {}
    return record.o.collection === 'inner-outer' ? 'layered' : '';
  }
  function naturalPoseWording(text) {
    return text.replace(/(【動作、視角與表情[^】]*】\n)([\s\S]*?)(?=\n\n【|$)/gu, (_match, header, action) => {
      const updated = action
        .replace(/若[^。\n]*(?:乳溝|胸線|胸前線條|胸型集中)[^。\n]*。/gu,
          '衣裝保持原有領口與穿著位置，依本題手臂姿勢與重力自然貼合。')
        .replace(/(?:使|讓|形成|呈現|凸顯|突出|製造)[^。\n]{0,35}(?:乳溝|胸前集中|胸前線條|胸型輪廓)[^。\n]*。/gu,
          '肩頸和軀幹維持本題原姿勢，服裝與人體自然受力。')
        .replace(/(?:刻意|明顯|強烈)(?:擠出|擠壓|集中)(?:胸部|胸型|乳溝)/gu, '維持自然的上半身姿勢')
        .replace(/\n{3,}/g, '\n\n');
      return header + updated;
    });
  }
  const imageInput = `【小森專案參考圖載入規則｜2026-10-25】
本題人物為同一位23歲成年女性小森／林予晴。若本次影像生成環境能取得Komori專案的原始參考圖片，請優先把小森半身正臉_FaceMaster_v2.jpeg實際提供給生圖模型；全身比例需要時使用小森全身照_BodyMaster_v3_面部修正版.jpeg，側面角度需要時使用小森半身側臉_AngleAux_v2.jpeg。FaceMaster只定義臉，BodyMaster只定義身形，AngleAux只輔助同一顆頭的旋轉；其餘參考圖不得改寫身份。若工具無法實際取得必要原圖，應明確告知並請使用者補圖；不能把專案檔名或文字記憶當成已實際輸入圖片。`;
  const innerEditorial = `【小森｜V.內著寫真・原款服裝展示】
以成年模特兒的服飾Lookbook／商品型錄方式拍攝。以本題【服裝硬鎖】為唯一服裝規格：原套裝的罩杯、肩帶、綁帶、剪裁、腰頭、下身、蕾絲、網紗、透膚與襯層等，按題目已指定的材質及原有覆蓋程度呈現；不加衣、不換衣、不改領口、不更改穿著層次，也不額外擴大裸露。攝影焦點為服裝版型、布料、衣片、縫線與完整穿著的自然效果，不另加入身體局部的強調鏡頭。保留P姿勢的手勢、表情、支點、視線和構圖。`;
  const layeredEditorial = `【小森｜V.時裝寫真・內著＋外搭原款展示】
本題為成年女性單人時裝Lookbook。內著、外搭、下身與配件全以【服裝硬鎖】的固定設計為準：保留外搭原本的開襟或扣合程度、長短、肩袖、衣片位置、內著可見範圍、肩帶、杯型、蕾絲、網紗、透膚材質、配色與層次；不得擅自扣起外搭、補上遮蓋衣物、替換內著或增加布片，也不額外擴大裸露。以造型層次、服裝工藝與正常攝影構圖為主，不加入額外的胸臀局部特寫。P姿勢、鏡頭方向、表情、手位、場景與畫面比例依原題。`;
  function upgrade(record, original) {
    if (!record || record.person !== '小森' || typeof original !== 'string') return original;
    let result = original;
    for (const [before, after] of corrections) result = result.replaceAll(before, after);
    if (result.includes('【小森專案參考圖載入規則｜2026-10-25】')) return result;
    const kind = photoType(record);
    if (kind) result = naturalPoseWording(result);
    const additions = [imageInput];
    if (kind === 'inner') additions.push(innerEditorial);
    if (kind === 'layered') additions.push(layeredEditorial);
    return additions.join('\n\n') + '\n\n' + result;
  }
  function patchedPromptForRecord(record) { return upgrade(record, previous.apply(this, arguments)); }
  window.promptForRecord = patchedPromptForRecord;
  window.__veraKomoriPromptPatch = {
    version: VERSION,
    scope: 'person=小森; V.內著寫真 and V.時裝寫真 / inner-outer; Komori reference filenames',
    prior: previous,
    upgrade,
    photoType,
    naturalPoseWording
  };
})();
