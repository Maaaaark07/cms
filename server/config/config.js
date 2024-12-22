import cfgData from './config.json' with { type: "json" };

const cfg = {
  ...cfgData,
  domainname: cfgData.DomainName,
};

export default cfg;