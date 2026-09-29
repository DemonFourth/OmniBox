// 配置与常量模块
// OmniBox 代理 Worker 的集中化配置

export interface PerformanceConfig {
  MAX_REDIRECT_DEPTH: number;
  REQUEST_TIMEOUT: number;
  STREAM_READ_TIMEOUT: number;
  MAX_RESPONSE_SIZE: number;
  MAX_TEXT_PROCESS_SIZE: number;
  CONCURRENT_REQUESTS_LIMIT: number;
}

export interface HeadersConfig {
  REMOVE_HEADERS: string[];
  STRIP_REQUEST_HEADERS: string[];
  ADD_HEADERS: Record<string, string>;
  CORS_HEADERS: Record<string, string>;
}

export interface AppConfig {
  VERSION: string;
  NAME: string;
  URL_SEPARATOR: string;
  DEFAULT_PASSWORD: string;
  PASSWORD_COOKIE_NAME: string;
  LAST_VISIT_COOKIE_NAME: string;
  PROXY_HINT_COOKIE_NAME: string;
  REPLACE_URL_OBJ: string;
  HTML_INJECT_FUNC_NAME: string;
  PROXY_HINT_DELAY: number;
  DEBUG_MODE: string;
  CORS_MAX_AGE: number;
  ROBOTS_TXT: string;
  CRAWLER_BLOCK_MESSAGE: string;
  COLO_NAMES: Record<string, string>;
  PERFORMANCE: PerformanceConfig;
  HEADERS: HeadersConfig;
}

export interface EnvVariables {
  ENVIRONMENT?: string;
  PROXY_PASSWORD?: string;
  DEBUG?: string;
  LOG_LEVEL?: string;
  SHOW_PASSWORD_PAGE?: string;
  BLOCKED_UA_PATTERNS?: string;
}

export const CONFIG: AppConfig = {
  VERSION: '1.0.0',
  NAME: 'OmniBox Proxy Worker',

  URL_SEPARATOR: '/',
  DEFAULT_PASSWORD: '',

  PASSWORD_COOKIE_NAME: '__OMNIBOX_PWD__',
  LAST_VISIT_COOKIE_NAME: '__OMNIBOX_VISITEDSITE__',
  PROXY_HINT_COOKIE_NAME: '__OMNIBOX_HINT__',

  REPLACE_URL_OBJ: '__location__omnibox__',
  HTML_INJECT_FUNC_NAME: 'parseAndInsertDoc',
  PROXY_HINT_DELAY: 5000,
  DEBUG_MODE: 'DEBUG_OMNIBOX_MODE',

  CORS_MAX_AGE: 86400,

  ROBOTS_TXT: `User-Agent: *
Disallow: /
Crawl-delay: 10

# OmniBox Proxy Worker - Not for crawling
# This is a proxy service, not content to be indexed`,

  CRAWLER_BLOCK_MESSAGE: `
<html>
<head><title>Access Restricted</title></head>
<body>
  <h1>Access Restricted</h1>
  <p>This proxy service is not available for automated crawling.</p>
  <p>Please use standard browsing methods to access content.</p>
</body>
</html>`,

  // Cloudflare 机房代码（IATA）→ 中文城市名，供 /api/trace 的 coloCity 字段使用；
  // 未收录的代码由消费端回退显示原始代码
  COLO_NAMES: {
    SJC: '圣何塞', SFO: '旧金山', LAX: '洛杉矶', SAN: '圣迭戈', PHX: '菲尼克斯',
    LAS: '拉斯维加斯', DEN: '丹佛', DFW: '达拉斯', IAH: '休斯顿', AUS: '奥斯汀',
    MIA: '迈阿密', MCO: '奥兰多', TPA: '坦帕', ATL: '亚特兰大', ORD: '芝加哥',
    DTW: '底特律', MSP: '明尼阿波利斯', CMH: '哥伦布', CLE: '克利夫兰', PHL: '费城',
    EWR: '纽瓦克', JFK: '纽约', LGA: '拉瓜迪亚', BOS: '波士顿', IAD: '华盛顿',
    RDU: '罗利', SEA: '西雅图', PDX: '波特兰', YYZ: '多伦多', YUL: '蒙特利尔',
    YVR: '温哥华', MEX: '墨西哥城', GDL: '瓜达拉哈拉', QRO: '克雷塔罗',
    GRU: '圣保罗', GIG: '里约热内卢', EZE: '布宜诺斯艾利斯', SCL: '圣地亚哥',
    LIM: '利马', BOG: '波哥大', SAL: '圣萨尔瓦多', UIO: '基多',
    LHR: '伦敦', MAN: '曼彻斯特', BRS: '布里斯托尔', EDI: '爱丁堡', DUB: '都柏林',
    CDG: '巴黎', AMS: '阿姆斯特丹', BRU: '布鲁塞尔', LUX: '卢森堡', DUS: '杜塞尔多夫',
    FRA: '法兰克福', BER: '柏林', HAM: '汉堡', MUC: '慕尼黑', VIE: '维也纳',
    ZRH: '苏黎世', GVA: '日内瓦', MIL: '米兰', FCO: '罗马', MAD: '马德里',
    BCN: '巴塞罗那', LIS: '里斯本', CPH: '哥本哈根', OSL: '奥斯陆', ARN: '斯德哥尔摩',
    GOT: '哥德堡', HEL: '赫尔辛基', WAW: '华沙', KRK: '克拉科夫', WRO: '弗罗茨瓦夫',
    PRG: '布拉格', BUD: '布达佩斯', BTS: '布拉迪斯拉发', SOF: '索菲亚', ATH: '雅典',
    IST: '伊斯坦布尔', TLV: '特拉维夫',
    HKG: '香港', MFM: '澳门', TPE: '台北', KHH: '高雄', NRT: '东京', KIX: '大阪',
    FUK: '福冈', NGO: '名古屋', ICN: '首尔', PUS: '釜山', SIN: '新加坡', KUL: '吉隆坡',
    BKK: '曼谷', HAN: '河内', SGN: '胡志明市', MNL: '马尼拉', CGK: '雅加达',
    DXB: '迪拜', RUH: '利雅得', DOH: '多哈', BOM: '孟买', DEL: '新德里',
    BLR: '班加罗尔', MAA: '金奈', HYD: '海得拉巴', CCU: '加尔各答', DAC: '达卡',
    KTM: '加德满都', TBS: '第比利斯', EVN: '埃里温', OVB: '新西伯利亚',
    BTK: '伊尔库茨克', TAS: '塔什干', ALA: '阿拉木图',
    CPT: '开普敦', JNB: '约翰内斯堡', NBO: '内罗毕', LOS: '拉各斯', TUN: '突尼斯',
    CMN: '卡萨布兰卡', ALG: '阿尔及尔', CAI: '开罗', DAK: '达喀尔',
    SYD: '悉尼', MEL: '墨尔本', BNE: '布里斯班', PER: '珀斯', AKL: '奥克兰'
  },

  PERFORMANCE: {
    MAX_REDIRECT_DEPTH: 5,
    REQUEST_TIMEOUT: 15000,
    STREAM_READ_TIMEOUT: 10000,
    MAX_RESPONSE_SIZE: 50 * 1024 * 1024,
    MAX_TEXT_PROCESS_SIZE: 5 * 1024 * 1024,
    CONCURRENT_REQUESTS_LIMIT: 10
  },

  HEADERS: {
    REMOVE_HEADERS: [
      'Content-Security-Policy',
      'Content-Security-Policy-Report-Only',
      'Permissions-Policy',
      'Cross-Origin-Embedder-Policy',
      'Cross-Origin-Resource-Policy',
      'X-Frame-Options',
      'Strict-Transport-Security'
    ],

    // 转发给上游前必须剥离的请求头（小写）：Cloudflare 边缘为浏览器请求注入的
    // cf-* 与 x-forwarded-*/真实IP类头会让信任这些头的上游站点看到用户真实 IP
    STRIP_REQUEST_HEADERS: [
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-forwarded-host',
      'x-forwarded-port',
      'x-real-ip',
      'x-client-ip',
      'x-cluster-ip',
      'true-client-ip'
    ],

    ADD_HEADERS: {
      'X-OmniBox-Proxy': '1.0.0',
      'X-Proxy-Service': 'OmniBox Proxy Worker',
      'X-Content-Type-Options': 'nosniff'
    },

    CORS_HEADERS: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': '*'
    }
  }
};
