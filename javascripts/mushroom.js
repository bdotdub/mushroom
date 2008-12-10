
// Modules/classes, namely $Spore and $Mushroom are modeled after
// Douglas Crockford module pattern. Read more about it here:
//  http://yuiblog.com/blog/2007/06/12/module-pattern/

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
  
  $Spore = function(soundObj, prev, next) {
    this.soundObj = soundObj;
    this.prev     = prev;
    this.next     = 'null!!';
    
    this.playSong = function() {
      console.log('hello!' + this.soundObj.sID)
    }
    
    return {
      play: this.playSong
    };
  }

  $Mushroom = function(playerElement, options) {
    // Properties
    this.playlist           = null;
    this.currentlyPlaying   = null;
    
    // Alias this to self
    self = this;
    
    // This goes through each of the items in the list and
    // sets up the sound for it
    this.addPlaylistSongs = function() {
      $('ul.playlist li', playerElement).each(function() {
        // Get the anchor with the URL
        var soundElement = $('a', this);
        if (soundElement.length == 0) {
          console.warn('No suitable song for this list item');
          return;
        }
        
        // Create the SoundManager sound
        var soundUrl = soundElement[0].href;
				thisSound = soundManager.createSound({
				  id:soundUrl,
				  url:soundUrl
				});
				
				// Get the playlist so we can find prev/next
				if (self.playlist == null) { self.playlist = new Array() }
				
				// Find the prev, if any.
				var prev = null;
				if (self.playlist.length > 0) {
				  var prevIndex = self.playlist.length;
				  prev = self.playlist[prevIndex];
				}
				
				// Create a new Spore
				var spore = new $Spore(thisSound, prev);
				
				self.playlist.push(spore);
      });
    };
    
    this.hookUpControls = function() {
      
    };
    
    // Do stuff!
    this.addPlaylistSongs();
    this.hookUpControls();
    
    console.log('blah! ' + this.playlist.length);
    this.playlist[0].play();
  }
})(jQuery);
