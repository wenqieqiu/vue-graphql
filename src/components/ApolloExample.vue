<template>
    <div class="apollo-example">
        <h3>商品列表</h3>

        <el-row
            type="flex"
            justify="center"
            class="row"
        >
            <el-col :span="18">
                <el-row
                    type="flex"
                    justify="end"
                    class="row"
                >
                    <el-col :span="4">
                        <el-button
                            type="primary"
                            icon="el-icon-plus"
                            @click="handleAdd"
                        >新增商品</el-button>
                    </el-col>
                </el-row>

                <!-- -------------商品列表-------------- -->
                <el-table
                    :data="goodsList"
                    border
                    stripe
                >
                    <el-table-column
                        prop="name"
                        label="商品名称"
                    ></el-table-column>
                    <el-table-column
                        prop="price"
                        label="商品价格"
                    ></el-table-column>
                    <el-table-column
                        prop="count"
                        label="商品库存"
                    ></el-table-column>
                    <el-table-column
                        prop="remark"
                        label="商品备注"
                    ></el-table-column>
                    <el-table-column
                        label="操作"
                        width="220px"
                    >
                        <template slot-scope="{row}">
                            <el-button
                                type="primary"
                                icon="el-icon-edit"
                                @click="handleUpdate(row)"
                            >修改</el-button>
                            <el-button
                                type="handleDelete"
                                icon="el-icon-delete"
                                @click="handleDelete(row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <!-- -----------商品表单------------ -->
        <GoodsFormDialog
            :goods="goodsForm"
            :show="showForm"
            :formType="formType"
            @close="handleCloseForm"
            @confirm="handleConfirm"
        ></GoodsFormDialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import GET_ALL_GOODS from '@/graphql/getAllGoods.gql'
import ADD_ONE_GOODS from '@/graphql/addOneGoods.gql'
import UPDATE_GOODS from '@/graphql/updateGoods.gql'
import DELETE_ONE_GOODS from '@/graphql/deleteOneGoods.gql'
import GoodsFormDialog from './GoodsFormDialog.vue'

export interface IGoods {
  id?: string
  name: string
  price: number
  count: number
  remark: string
}

interface IQueryGetAllGoods {
  getAllGoods: IGoods[]
}

@Component({
  components: { GoodsFormDialog },
  apollo: {},
})
export default class ApolloExample extends Vue {
  // 表单数据
  goodsForm: IGoods | null = null

  goodsList: IGoods[] = []

  showForm = false

  formType = 'new'

  created() {
    this.getAllGoodsData()
  }

  // 获取所有商品数据
  getAllGoodsData() {
    this.$apollo
      .query({ query: GET_ALL_GOODS })
      .then(res => {
        this.goodsList = res.data.getAllGoods
      })
      .catch(e => {
        this.$notify.error(`请求错误: ${e.message}`)
        this.goodsList = []
      })
  }

  // 新增一个商品
  handleAddOneGoods(form: IGoods) {
    this.$apollo
      .mutate({
        mutation: ADD_ONE_GOODS,
        variables: { goods: form },
        // 更新缓存
        update: (store, { data: { addOneGoods } }) => {
          const query = store.readQuery({ query: GET_ALL_GOODS }) as IQueryGetAllGoods
          query.getAllGoods.push(addOneGoods)
          store.writeQuery({ query: GET_ALL_GOODS, data: query })
        },
      })
      .then(() => {
        this.$message.success('修改商品信息成功')
        this.getAllGoodsData()
        this.handleCloseForm()
      })
      .catch(e => {
        this.$notify.error(`请求错误: ${e.message}`)
      })
  }

  // 更新商品信息
  handleUpdateGoods(form: IGoods) {
    this.$apollo
      .mutate({
        mutation: UPDATE_GOODS,
        variables: { goods: form },
        // 更新缓存
        update: (store, { data: { updateGoods } }) => {
          const query = store.readQuery({ query: GET_ALL_GOODS }) as IQueryGetAllGoods
          const goodsIndex = query.getAllGoods.findIndex(goods => goods.id === updateGoods.id)
          query.getAllGoods[goodsIndex] = updateGoods
          store.writeQuery({ query: GET_ALL_GOODS, data: query })
        },
      })
      .then(() => {
        this.$message.success('修改商品信息成功')
        this.getAllGoodsData()
        this.handleCloseForm()
      })
      .catch(e => {
        this.$notify.error(`请求错误: ${e.message}`)
      })
  }

  handleCloseForm() {
    this.showForm = false
  }

  // 表单弹窗确认
  handleConfirm(form: IGoods) {
    if (this.formType === 'new') {
      this.handleAddOneGoods(form)
    } else {
      this.handleUpdateGoods(form)
    }
  }

  // 点击新增
  handleAdd() {
    this.goodsForm = {
      name: '',
      price: 0,
      count: 0,
      remark: '',
    }
    this.formType = 'new'
    this.showForm = true
  }

  // 点击修改
  handleUpdate(row: IGoods) {
    this.goodsForm = { ...row }
    this.formType = 'edit'
    this.showForm = true
  }

  // 点击删除
  handleDelete(row: IGoods) {
    this.$confirm('确定删除选择的商品？此操作不可撤销！', { type: 'warning' })
      .then(() => {
        this.$apollo
          .mutate({
            mutation: DELETE_ONE_GOODS,
            variables: { id: row.id },
            // 更新缓存
            update: (store, { data: { deleteOneGoods } }) => {
              // 未删除成功
              if (!deleteOneGoods) return

              const query = store.readQuery({ query: GET_ALL_GOODS }) as IQueryGetAllGoods
              const goodsIndex = query.getAllGoods.findIndex(goods => goods.id === row.id)
              query.getAllGoods.splice(goodsIndex, 1)
              store.writeQuery({ query: GET_ALL_GOODS, data: query })
            },
          })
          .then(() => {
            this.$message.success('删除商品成功')
            this.getAllGoodsData()
          })
          .catch(e => {
            this.$notify.error(`请求错误: ${e.message}`)
          })
      })
      .catch(() => {
        this.$message.warning('取消删除')
      })
  }
}
</script>

<style lang="scss" scoped>
.apollo-example {
  padding: 40px 0;
}
.row {
  margin-bottom: 20px;
}

.single-goods {
  margin: 20px 28%;
  text-align: start;
  font-size: 14px;
  font-weight: 600;
  font-family: sans-serif;
}

.goods-detail-card {
  padding: 10px 20px;
}

.form,
.input,
.apollo,
.message {
  padding: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
}

.input {
  font-family: inherit;
  font-size: inherit;
  border: solid 2px #ccc;
  border-radius: 3px;
}

.error {
  color: red;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
  grid-gap: 10px;
}

.image-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  border-radius: 8px;
}

.image {
  max-width: 100%;
  max-height: 100%;
}

.image-input {
  margin: 20px;
}
</style>
