import debugHelper from '../util/debug_helper';

const { print } = debugHelper(__filename);

const printEnvs = (): void => {
  const params = {};
  [...Object.keys(process.env).filter((k) => k.startsWith('WAAR_')), 'NODE_ENV']
    .forEach((k) => {
      params[k] = process.env[k];
    });

  print({ params });
};

export default printEnvs;
