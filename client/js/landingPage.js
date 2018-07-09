window.addEventListener('load', () => {
  console.log('starting from js')
  var elems = document.querySelectorAll('.slider');
  console.log(elems)
  var instances = M.Slider.init(elems, {
    indicators: false
  });
  console.log('finishing from js');

});
