function resizeImage(file, maxWidth) {


    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function(event) {
          var img = new Image();
          img.onload = function() {
            var canvas = document.createElement('canvas');
            var scaleFactor = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleFactor;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function(blob) {
              resolve(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            }, file.type);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
  }
  export default resizeImage


