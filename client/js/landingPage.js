window.addEventListener('load', () => {
  let elems = document.querySelectorAll('.slider');
  let instances = M.Slider.init(elems, {
    indicators: false
  });
});
