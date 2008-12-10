(function($) {
  $.fn.mushroom = function(options) {
    var defaults = {
      
    };

    // Merge defaults and options
    var options = $.extend(defaults, options);

    // Do some checks for the options
    
    // Iterate over each element
    return this.each(function() {
      new $Mushroom(this, options);
    });
  };

  function mushroomify(playerElement, options) {
    $('ul.playlist li', playerElement).click(function() {
      var soundElement = $('a', this);
      if (soundElement.length != 0) {
        var soundUrl = soundElement[0].href;
				thisSound = soundManager.createSound({
				  id:soundUrl,
				  url:soundUrl
				});

        soundManager.stopAll();
        thisSound.play();
      }
      else {
        // Log and let them know it should only on link per element
      }
      return false;
    });
  }
})(jQuery);
