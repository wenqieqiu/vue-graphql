const path = require('path')
const { loadEnv } = require('vue-cli-plugin-apollo/utils/load-env')

// 从 .env 文件获取配置
const env = loadEnv([path.resolve(__dirname, '.env'), path.resolve(__dirname, '.env.local')])

module.exports = {
  client: {
    service: {
      name: env.VUE_APP_APOLLO_ENGINE_SERVICE,
      url: env.APOLLO_ENGINE_API_ENDPOINT, // GraphQL服务url
      skipSSLValidation: true,
      addTypename: false,
      // localSchemaFile: './src/graphql/schema.graphql', //本地类型定义
    },
    includes: ['src/**/*.{js,jsx,ts,tsx,vue,gql}'],
  },
  engine: {
    endpoint: env.APOLLO_ENGINE_API_ENDPOINT,
    apiKey: env.VUE_APP_APOLLO_ENGINE_KEY,
  },
}
