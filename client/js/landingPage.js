window.addEventListener('load', () => {
  const elems = document.querySelectorAll('.slider');
  const instances = M.Slider.init(elems, {
    indicators: false
  });
});
