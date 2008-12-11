
// Modules/classes, namely $Spore and $Mushroom are modeled after
// Douglas Crockford module pattern. Read more about it here:
//  http://yuiblog.com/blog/2007/06/12/module-pattern/

(function($) {
  $.fn.mushroom = function(options) {
    var defaults = {
      repeat: true
    };

    // Merge defaults and options
    var options = $.extend(defaults, options);

    // Do some checks for the options
    
    // Iterate over each element
    return this.each(function() {
      new $Mushroom(this, options);
    });
  };
  
  $Spore = function(parent, soundElement, soundUrl, prevSong, nextSong) {
    // Properties
    this.element  = soundElement;
    this.prevSong = prevSong;
    this.nextSong = null;
    this.soundObj = null;
    this.url      = soundUrl;
    this.mushroom = parent;
    
    // Alias this to self
    var self = this;
    
    // Play this!
    this.play = function() {
      self.soundObj.play();
      self.element.parent().addClass('playing');
    };
    
    // Stop it
    this.stop = function() {
      self.element.parent().removeClass('playing');
      self.soundObj.stop();
    }
    
    // Stop it
    this.pause = function() {
      self.soundObj.pause();
    }
    
    // Click handler
    this.click = function() {
      self.mushroom.currentlyPlaying.stop();
      
      // Set a currentlyPlaying
      self.mushroom.currentlyPlaying = self;
      
      // Stop and then play
      soundManager.stopAll();
      self.play();
      
      // Stop the click
      return false;
    };
    
    this.init = function() {
      // Set up the links
      var prevSong = self.prevSong;
      if (prevSong != null) {
        prevSong.nextSong = self;
      }
      
      // Attach the click handler
      self.element.click(self.click);
      
      // Create the sound object
      self.soundObj = soundManager.createSound({
			  id:self.url,
			  url:self.url,
			  onfinish: self.mushroom.goToNextSong
			});
    };
    
    this.init();
  };

  $Mushroom = function(playerElement, options) {
    // Properties
    this.playlist           = null;
    this.currentlyPlaying   = null;
    this.options            = options;
    
    // Alias this to self
    var self = this;
    
    // This goes through each of the items in the list and
    // sets up the sound for it
    this.addPlaylistSongs = function() {
      $('ul.playlist li', self.playerElement).each(function() {
        // Get the anchor with the URL
        var soundElement = $('a', this);
        if (soundElement.length == 0) {
          // console.warn('No suitable song for this list item');
          return;
        }
        
        // Get the playlist so we can find prev/next
				if (self.playlist == null) { self.playlist = new Array() }
				
				// Find the prev, if any.
				var prev = null;
				if (self.playlist.length > 0) {
				  var prevIndex = self.playlist.length - 1;
				  prev = self.playlist[prevIndex];
				}
				
				// Get the song URL
        var soundUrl = soundElement[0].href;
				
				// Create a new Spore
				var spore = new $Spore(self, soundElement, soundUrl, prev);
				self.playlist.push(spore);
      });
      
      // Set initial current song
      if (self.playlist.length > 0) {
        self.currentlyPlaying = self.playlist[0];
      }
    };
    
    this.hookUpControls = function() {
      // Setup play button
      $('.play', self.playerElement).click(function() {
        if (!playlistHasSongs) { return; }
        self.currentlyPlaying.play();
      });
      
      // Setup stop button
      $('.stop', self.playerElement).click(function() {
        if (!playlistHasSongs) { return; }
        self.currentlyPlaying.stop();
      });
      
      // Setup play button
      $('.pause', self.playerElement).click(function() {
        if (!playlistHasSongs) { return; }
        self.currentlyPlaying.pause();
      });
    };
    
    function playlistHasSongs() {
      return (self.playlist.length > 0);
    }
    
    // Sound object handlers
    this.goToNextSong = function() {
      self.currentlyPlaying.stop();
      self.currentlyPlaying = self.currentlyPlaying.nextSong;

      if (self.currentlyPlaying == null && self.options.repeat) {
        self.currentlyPlaying = self.playlist[0];
      }
      
      if (self.currentlyPlaying != null) {
        self.currentlyPlaying.play();
      }
    };
    
    // Do stuff!
    this.addPlaylistSongs();
    this.hookUpControls();
  };
  
})(jQuery);
