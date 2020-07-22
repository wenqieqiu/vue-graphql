> 在上篇 [基于 NestJS 快速搭建 GraphQL 服务](https://juejin.im/post/5f1556c2f265da22be0d964e)中，我们使用 NestJS 快速搭建了一个具有 CRUD 功能的
> GraphQL API 服务。所以这篇文章将简单示例在 Vue 项目中，如何像使用 axios 那样便捷的调用 GraphQL API 实现增删改查；

技术栈 `Vue` + `TypeScript` + `Vue-Apollo`

### 第一步，创建项目

1. #### 使用@vue/cli 创建项目

   ```bash
     # 创建项目
     vue create vue-apollo-graphql
   ```

   > 输入命令后命令行询问会询问是否使用预设：

   ```bash
   Vue CLI v4.4.6
   ? Please pick a preset:
     default (babel, eslint)
   > Manually select features  # 选择手动配置，回车
   ```

   > 然后会让我们选择特性(_上下箭头移动选项，空格切换选中_)：

   ```bash
    Vue CLI v4.4.6
    ? Please pick a preset: Manually select features
    ? Check the features needed for your project:
    >(*) Babel
     (*) TypeScript # 使用ts
     ( ) Progressive Web App (PWA) Support
     (*) Router
     ( ) Vuex
     ( ) CSS Pre-processors
     (*) Linter / Formatter
     ( ) Unit Testing
     ( ) E2E Testing
   ```

   > 后面还会询问是否使用 class 风格的 vue 组件等等，个人比较喜欢 class 风格，所以选择 Yes，完整选项如下：

   ![](https://user-gold-cdn.xitu.io/2020/7/22/173749338ce758a5?w=797&h=187&f=png&s=26079)

2. #### 添加 vue-cli-plugin-apollo 插件

   ```bash
     vue add apollo
   ```

   > 添加完成后插件会询问我们是否添加示例代码，是否添加 GraphQL 服务，是否配置 Apollo 引擎，我们这里不太需要这些，直接一路选 N 就可以了：

   ![](https://user-gold-cdn.xitu.io/2020/7/22/173749786374aa1d?w=255&h=65&f=png&s=3642)

3. #### 启动项目

   ```bash
     yarn
     yarn serve
   ```

---

### 第二步，配置 Apollo-GraphQL

1. #### 修改根目录下的`apollo.config.js`用于配置 VScode 的`Apollo GraphQL`插件,获取服务器 的 GraphQL 类型定义；

   > 需要 VScode 提前安装`Apollo GraphQL`插件

   ```js
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
   ```

   配置详情可以查看`apollo-graphql`的官网 [配置文档](https://www.apollographql.com/docs/devtools/apollo-config/)；

2. #### 修改`src/vue-apollo.ts`用于设置[ vue-apollo ](https://vue-cli-plugin-apollo.netlify.app/guide/configuration.html)连接配置；

   ```ts
   //省略了其他未变动设置
   const defaultOptions = {
     // 设置去除__typename字段
     inMemoryCacheOptions: {
       addTypename: false,
     },
   }
   ```

   > 默认下 apollo-graphql 返回的数据里会有一个`__typename` 字段，用于确定返回类型。但是我们并不需要，而且会影响表单的使用，所以这里设置不添
   > 加`__typename`字段

---

### 第三步，使用 Apollo-GraphQL 进行 CRUD

首先我们在 `src/components` 下新建`ApolloExample.vue`；

1. #### 新增商品

   1. ##### 在`src/graphql`下创建`addOneGoods.gql`，用于新增商品:

   ```gql
   mutation addOneGoods($goods: GoodsInsertTypeGraphql!) {
     addOneGoods(goods: $goods) {
       id
       name
       price
       count
       remark
     }
   }
   ```

   > `.gql`的语法可以查看官网 [GraphQL 学习文档](https://graphql.cn/learn/)

   3. ##### 引入`addOneGoods.gql`，使用`this.$apollo.mutate`调用此 Mutations，新增商品信息：

   ```ts
     import ADD_ONE_GOODS from '@/graphql/addOneGoods.gql'

     // 新增一个商品
     handleAddOneGoods(goods: IGoods) {
       this.$apollo
         .mutate({
           mutation: ADD_ONE_GOODS,
           variables: { goods: goods },
         })
         .then(() => {
           this.$message.success('修改商品信息成功')
         })
         .catch(e => {
           this.$notify.error(`请求错误: ${e.message}`)
         })
     }
   ```

   > `IGoods`是商品的类型定义：

   ```ts
   export interface IGoods {
     id?: string
     name: string
     price: number
     count: number
     remark: string
   }
   ```

---

2. #### 查询商品列表

   1. ##### 在`src/graphql`下创建`getAllGoods.gql`，用于查询所有商品；

      ```gql
      query getAllGoods {
        getAllGoods {
          id
          name
          price
          count
          remark
        }
      }
      ```

   2. ##### 在`components/ApolloExample.vue`里引入`getAllGoods.gql`，使用`this.$apollo.query`调用此 Query；

      ```ts
      import GET_ALL_GOODS from '@/graphql/getAllGoods.gql'

      getAllGoodsData() {
        this.$apollo
          .query({ query: GOODS })
          .then(res => {
            this.goodsList = res.data.getAllGoods
          })
          .catch(e => {
            this.$notify.error(`获取商品列表失败: ${e.message}`)
            this.goodsList = []
          })
      }
      ```

3. #### 更新商品信息

   1. ##### 在`src/graphql`下创建`updateGoods.gql`，用于更新商品；

      ```gql
      mutation updateGoods($goods: GoodsInputTypeGraphql!) {
        updateGoods(goods: $goods) {
          id
          name
          price
          count
          remark
        }
      }
      ```

   2. ##### 引入`updateGoods.gql`，使用`this.$apollo.mutate`调用此 Mutations，更新商品信息；

      ```ts
      import UPDATE_GOODS from '@/graphql/updateGoods.gql'

      // 新增一个商品
      handleAddOneGoods(goods: IGoods) {
        this.$apollo
          .mutate({
            mutation: UPDATE_GOODS,
            variables: { goods: goods },
          })
          .then(() => {
            this.$message.success('修改商品信息成功')
          })
          .catch(e => {
            this.$notify.error(`请求错误: ${e.message}`)
          })
      }
      ```

---

4. #### 删除商品

   1. ##### 在`src/graphql`下创建`deleteOneGoods.gql`，用于删除商品；

      ```gql
      mutation deleteOneGoods($id: String!) {
        deleteOneGoods(id: $id)
      }
      ```

   2. ##### 引入`deleteOneGoods.gql`，使用`this.$apollo.mutate`调用此 Mutations，更新商品信息；

      ```ts
      import DELETE_ONE_GOODS from '@/graphql/deleteOneGoods.gql'

      // 删除一个商品
      handleDelete(goods: IGoods) {
        this.$apollo
          .mutate({
            mutation: DELETE_ONE_GOODS,
            variables: { id: goods.id },
          })
          .then(() => {
            this.$message.success('修改商品成功')
          })
          .catch(e => {
            this.$notify.error(`请求错误: ${e.message}`)
          })
      }
      ```

---

#### 这样我们就完成基础的 CRUD 操作了，最后为了方便展示，简单用 element-ui 写一下界面：

![](https://user-gold-cdn.xitu.io/2020/7/22/17375776672f6f16?w=836&h=441&f=png&s=30842)

![](https://user-gold-cdn.xitu.io/2020/7/22/1737578def70afaf?w=841&h=570&f=png&s=29914)

![](https://user-gold-cdn.xitu.io/2020/7/22/1737579689805604?w=816&h=595&f=png&s=32560)

#### 总结一下：

大致使用流程和 axios 请求差别不大

- 定义`.gql`文件类似于 axios 定义 api 请求；
- 引入`.gql`文件类似于引入定义 api 请求方法；
- 使用`this.$apollo.query`或者`mutate`，类似于`axios.get`或者`axios.post`调用接口，传递参数；

#### 踩坑：

由于 vue-apollo 库默认使用了接口缓存，所以短时间内重复的 query 请求不会去获取最新数据，所以在实际使用`this.$apollo.mutate`方法的时候都会写`update`回调
，用于更新对应 query 的缓存数据，完整代码中有示例；

---

#### 项目 github 地址 [https://github.com/wenqieqiu/vue-graphql](https://github.com/wenqieqiu/vue-graphql)
