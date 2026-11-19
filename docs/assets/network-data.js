// Region totals count the existing partner entries, not universities or campuses.
// Person locations are linked only when an institutional profile supports them.
window.ODB_NETWORK_DATA = {
  regions: [
    { key: 'mainland', en: 'Chinese mainland', zh: '中国大陆', partners: ['cuhk', 'frd', 'peking-university', 'ptcls', 'pku-biomedical-imaging'], anchor: [116.4, 39.9], label: [81, 20] },
    { key: 'hong-kong', en: 'Hong Kong, China', zh: '中国香港', partners: ['hku', 'prince-philip-dental-hospital'], anchor: [114.17, 22.3], label: [86, 47] },
    { key: 'nigeria', en: 'Nigeria', zh: '尼日利亚', partners: ['nha', 'cmul', 'buk', 'udus', 'maiduguri'], anchor: [7.49, 9.07], label: [42, 57] },
    { key: 'united-states', en: 'United States', zh: '美国', partners: ['mayo'], anchor: [-92.46, 44.01], label: [24, 35] },
    { key: 'germany', en: 'Germany', zh: '德国', partners: ['lmu'], anchor: [11.58, 48.14], label: [53, 16] },
    { key: 'malaysia', en: 'Malaysia', zh: '马来西亚', partners: ['segi'], anchor: [101.7, 3.14], label: [81, 71] },
    { key: 'ethiopia', en: 'Ethiopia', zh: '埃塞俄比亚', partners: ['mwu'], anchor: [39.98, 7.1], label: [62, 83] }
  ],
  profiles: {
    '059-junwen-wang': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://hub.hku.hk/cris/rp/rp00280' },
    '060-zuolin-jin': { region: 'mainland', partners: [], en: 'Shenzhen Stomatology Hospital (Pingshan), Southern Medical University', zh: '南方医科大学深圳口腔医院（坪山）', url: 'https://www.smuszsh.com/yygk/ldtd/content/post_1633338.html' },
    '061-benyou-wang': { region: 'mainland', partners: ['cuhk'], en: 'The Chinese University of Hong Kong, Shenzhen', zh: '香港中文大学（深圳）', url: 'https://sds.cuhk.edu.cn/en/teacher/571' },
    '063-walter-yu-hang-lam': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://facdent.hku.hk/people/professoriate-staff/profile/retlaw' },
    '064-will-wei-qiao': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://datascience.hku.hk/professor-wei-qiao/' },
    '065-john-adeoye': { region: 'hong-kong', partners: ['hku'], en: 'Faculty of Dentistry, The University of Hong Kong', zh: '香港大学牙医学院', url: 'https://facdent.hku.hk/people/professoriate-staff/profile/jadeoye' }
  }
};
