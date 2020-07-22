<template>
    <div class="goods-form-dialog">
        <el-dialog
            :title="title"
            :visible="show"
            width="600px"
            @close="handleClose"
        >
            <el-form
                v-if="form"
                ref="goods"
                :model="form"
                :rules="goodsRules"
                label-width="80px"
            >
                <el-form-item
                    v-if="formType!=='new'"
                    label="ID"
                >
                    <el-input
                        v-model="goods.id"
                        disabled
                    ></el-input>
                </el-form-item>
                <el-form-item
                    prop="name"
                    label="商品名称"
                >
                    <el-input v-model="goods.name"></el-input>
                </el-form-item>
                <el-form-item
                    prop="price"
                    label="商品价格"
                >
                    <el-input
                        type="number"
                        v-model.number="goods.price"
                    ></el-input>
                </el-form-item>
                <el-form-item
                    prop="count"
                    label="商品库存"
                >
                    <el-input-number v-model.number="goods.count"></el-input-number>
                </el-form-item>
                <el-form-item
                    prop="remark"
                    label="商品备注"
                >
                    <el-input v-model="goods.remark"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button
                    type="primary"
                    @click="handleConfirm"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Ref, Watch } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { IGoods } from './ApolloExample.vue'

@Component({
  components: {},
})
export default class GoodsFormDialog extends Vue {
  // property
  @Prop({ type: Object, default: () => {} }) readonly goods!: IGoods

  @Prop({ type: Boolean, default: false }) readonly show!: boolean

  @Prop({ type: String, default: 'new' }) readonly formType!: string

  // data
  form = this.goods

  goodsRules = {
    name: [{ type: 'string', required: true, message: '商品名称不能为空' }],
    price: [{ type: 'number', required: true, message: '商品价格不能为空' }],
    count: [{ type: 'number', required: true, message: '商品库存不能为空' }],
    remark: [{ type: 'string', required: false, message: '商品备注不能为空' }],
  }

  // computed
  @Ref('goods') GoodsRef!: Form

  get title() {
    return this.formType === 'new' ? '新增商品' : '修改商品信息'
  }

  @Watch('goods', { immediate: true, deep: true })
  handleGoodsChanged(newVal) {
    this.form = newVal
  }

  // methods
  handleClose() {
    this.$emit('close')
  }

  handleConfirm() {
    this.$emit('confirm', this.goods)
  }
}
</script>
<style lang="scss">
.goods-form-dialog {
}
</style>
