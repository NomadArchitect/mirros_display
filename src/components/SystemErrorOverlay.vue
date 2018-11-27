<template functional>
    <div class="error__box">
        <div class="error__icon">
            <slot name="icon"></slot>
        </div>
        <section>
            <h4 class="error__title">
                <slot name="title"></slot>
            </h4>
            <p>
                <slot name="text"></slot>
            </p>
        </section>
    </div>
</template>
<script>
export default {
  name: "SystemErrorOverlay"
};
</script>
<style lang="scss">
@import "../assets/sass/variables";

.error__box {
  background-color: $white;
  position: absolute;
  bottom: 0;
  width: 90%;
  padding: 1rem 2rem;
  font-size: 2rem;
  left: calc(5% - 1rem);
  color: black;
  display: flex;
  align-items: center;
}

.error__icon {
  margin-right: 1rem;
}

.error__title {
  margin: 1rem 0;
}
</style>
