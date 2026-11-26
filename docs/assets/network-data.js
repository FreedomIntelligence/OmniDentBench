// Region totals count the existing partner entries, not universities or campuses.
// Person locations are linked only when an institutional profile supports them.
window.ODB_NETWORK_DATA = {
  regions: [
    { key: 'mainland', code: 'CN', en: 'Chinese mainland', zh: '中国大陆', partners: ['cuhk', 'frd', 'peking-university', 'ptcls', 'pku-biomedical-imaging'], anchor: [116.4, 39.9], label: [88, 24], cardAlign: 'above' },
    { key: 'hong-kong', code: 'HK', en: 'Hong Kong, China', zh: '中国香港', partners: ['hku', 'prince-philip-dental-hospital'], anchor: [114.17, 22.3], label: [89, 63], cardAlign: 'below' },
    { key: 'nigeria', code: 'NG', en: 'Nigeria', zh: '尼日利亚', partners: ['nha', 'cmul', 'buk', 'udus', 'maiduguri'], anchor: [7.49, 9.07], label: [32, 63], cardAlign: 'below' },
    { key: 'united-states', code: 'US', en: 'United States', zh: '美国', partners: ['mayo'], anchor: [-92.46, 44.01], label: [18.5, 37.5], cardAlign: 'left' },
    { key: 'germany', code: 'DE', en: 'Germany', zh: '德国', partners: ['lmu'], anchor: [11.58, 48.14], label: [58, 15.5], cardAlign: 'above' },
    { key: 'malaysia', code: 'MY', en: 'Malaysia', zh: '马来西亚', partners: ['segi'], anchor: [101.7, 3.14], label: [70, 63], cardAlign: 'below' },
    { key: 'ethiopia', code: 'ET', en: 'Ethiopia', zh: '埃塞俄比亚', partners: ['mwu'], anchor: [39.98, 7.1], label: [51, 63], cardAlign: 'below' }
  ],
  profiles: {
    '010-feng-wang': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/diawang' },
    '045-wu-songying': { region: 'hong-kong', partners: ['hku'], url: 'https://mehu.hku.hk/26-27-mhcc-05/#:~:text=Alice%20Songying%20Wu' },
    '059-junwen-wang': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://hub.hku.hk/cris/rp/rp00280' },
    '060-zuolin-jin': { region: 'mainland', partners: [], en: 'Shenzhen Stomatology Hospital (Pingshan), Southern Medical University', zh: '南方医科大学深圳口腔医院（坪山）', url: 'https://www.smuszsh.com/yygk/ldtd/content/post_1633338.html' },
    '061-benyou-wang': { region: 'mainland', partners: ['cuhk'], en: 'The Chinese University of Hong Kong, Shenzhen', zh: '香港中文大学（深圳）', url: 'https://sds.cuhk.edu.cn/en/teacher/571' },
    '063-walter-yu-hang-lam': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://facdent.hku.hk/people/professoriate-staff/profile/retlaw' },
    '064-will-wei-qiao': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://datascience.hku.hk/professor-wei-qiao/' },
    '065-john-adeoye': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://facdent.hku.hk/people/professoriate-staff/profile/jadeoye' },
    '066-shan-zhiyi': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/shanzhiy' },
    '067-teddy-weifa-yang': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/teddyrun' },
    '068-xin-li': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/xli0712' },
    '069-zhongyuan-tang': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/tangzy' },
    '070-junjie-zhao': { region: 'hong-kong', partners: ['hku'], url: 'https://gradsch.hku.hk/news_and_events/newsletter/junjie-zhao-pioneering-research-biomedical-imaging-and-dental-ai' },
    '075-andrew-nalley': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/analley' },
    '076-george-pelekos': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/george74' },
    '077-pradeep-singh': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/pradeep' },
    '078-gloria-hai-ming-wong': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/wonghmg' },
    '079-lijian-jin': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/ljjin' },
    '092-colman-mcgrath': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/mcgrathc' },
    '093-edward-chin-man': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/people/professoriate-staff/profile/edward-lo' },
    '099-nasir-bashir': { region: 'hong-kong', partners: ['hku'], url: 'https://facdent.hku.hk/geh/cpd-20261027.php' }
  }
};
