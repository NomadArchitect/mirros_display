<template>
  <canvas ref="QRCode" width="150" height="150"></canvas>
</template>

<script>
import QRCode from "qrcode";

export default {
  name: "QRCode",
  props: {
    content: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      default: 150,
    },
    height: {
      type: Number,
      default: 150,
    },
  },
  watch: {
    content: {
      immediate: true,
      handler: async function () {
        await this.$nextTick();
        QRCode.toDataURL(this.$refs.QRCode, this.content, {
          margin: 2,
          width: 150,
        });
      },
    },
  },
};
</script>
