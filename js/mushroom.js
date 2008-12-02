(function($) {
  $.fn.mushroom = function(options) {
    var defaults = {
      
    };

    // Merge defaults and options
    var options = $.extend(defaults, options);

    // Do some checks for the options
    
    // Iterate over each element
    return this.each(function() {
      mushroomify(this, options);
    });
  };

  function mushroomify(this, options) {
  }
})(jQuery);
