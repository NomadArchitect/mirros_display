<template functional>
  <div class="error__box">
    <div class="error__icon"><slot name="icon"></slot></div>
    <section>
      <h4 class="error__title"><slot name="title"></slot></h4>
      <p class="error__text"><slot name="text"></slot></p>
    </section>
  </div>
</template>
<script>
export default {
  name: "SystemErrorOverlay",
};
</script>
<style>
.error__box {
  align-items: center;
  background-color: var(--white);
  border-top-left-radius: 0.625rem;
  border-top-right-radius: 0.625rem;
  position: absolute;
  bottom: 0;
  color: black;
  display: flex;
  font-size: 2rem;
  padding: 1rem 2rem;
  width: 95%;
}

.error__icon {
  margin-right: 1rem;
}

.error__title {
  margin: 1rem 0;
}

.error__text {
  line-height: 2rem;
}
</style>
