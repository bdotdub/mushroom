/*
   mushroom
   --------------------------------------------
   http://github.com/bdotdub/mushroom

   Copyright (c) 2008, Benny Wong. All rights reserved.
   Code licensed under the GPLv3:
   http://www.gnu.org/licenses/gpl-3.0.html

*/

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
      if (self.soundObj.paused) {
        self.soundObj.resume();
      }
      else {
        self.soundObj.play();
      }

      self.element.addClass('playing');
    };
    
    // Stop it
    this.stop = function() {
      self.element.removeClass('playing');
      self.soundObj.stop();
    }
    
    // Stop it
    this.pause = function() {
      self.soundObj.pause();
    }
    
    // Check if it's playing
    this.playing = function() {
      // It is playing only if the playState == 1 and it is not paused
      return self.soundObj.playState == 1 && !self.soundObj.paused;
    }
    
    // Click handler
    this.click = function() {
      self.mushroom.play(self);
      
      // Stop the click
      return false;
    };
    
    // Constructor
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
			  id: self.url,
			  url: self.url,
			  whileloading: self.mushroom.loadingProgress,
			  whileplaying: self.mushroom.playingProgress,
			  onfinish: self.mushroom.goToNextSong,
			  onstop: self.mushroom.songStopped
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
    
    ///////////////////////////////////////////////////////////
    // Public functions
    
    this.play = function(spore) {
      if (self.currentlyPlaying == null) {
        self.currentlyPlaying = spore;
      }
      
      // Check if it's the same spore that was clicked
      if (spore == self.currentlyPlaying) {
        // If it's playing, pause it
        if (spore.playing()) {
          spore.pause();
        }
        // Else resume!
        else {
          spore.play();
        }
      }
      // Else play this song
      else {
        // Stop the current song
        self.currentlyPlaying.stop();
        
        // Assign it as the currently playing and play it
        self.currentlyPlaying = spore;
        self.currentlyPlaying.play();
        
        // Set the volume to the current volume
        self.currentlyPlaying.soundObj.setVolume(self.volume.slider.slider("value"))
      }

      // Now check if it's already loaded. If so, we need to set the loaded bar
      // ahead
      if (self.currentlyPlaying.soundObj.bytesLoaded == self.currentlyPlaying.soundObj.bytesTotal) {
        setLoadingProgress(100);
      }
    }
    
    // Sound object handlers
    this.goToNextSong = function() {
      self.goToSong('NEXT');
    };
    
    this.goToPreviousSong = function() {
      self.goToSong('BACK');
    };
    
    this.goToSong = function(direction) {
      // Stop the song and assign it the [next|prev] song
      self.currentlyPlaying.stop();
      self.currentlyPlaying = (direction == 'BACK') ?
        self.currentlyPlaying.prevSong : self.currentlyPlaying.nextSong;

      // If it's the end or beginning and we repeat, we need to loop back around.
      // I can't help but feel this next block should be combined with the block
      // above this. anyway, who cares
      if (self.currentlyPlaying == null && self.options.repeat) {
        self.currentlyPlaying = (direction == 'BACK') ? self.playlist[self.playlist.length - 1] : self.playlist[0];
      }

      if (self.currentlyPlaying != null) {
        self.currentlyPlaying.play();
      }
    };
    
    ///////////////////////////////////////////////////////////
    // IoC endpoints
    
    this.songStopped = function() {
      self.progress.slider.slider("moveTo", 0);
      $('.loading', self.playerElement).css('width', 0);
    }
    
    this.loadingProgress = function() {
      var percentage = this.bytesLoaded * 100 / this.bytesTotal;
      setLoadingProgress(percentage);
    };
    
    this.playingProgress = function() {
      var currentPosition = (this.position * 100) / this.durationEstimate;
      
      // If the handle is not being dragged, the update it
      if (!self.progress.isDragging) {
        self.progress.slider.slider("moveTo", currentPosition);
      }
    }
    
    ///////////////////////////////////////////////////////////
    // Progress slider stuff
    
    // Default progress options
    self.progress = {
      isDragging: false,
      handle: '.progress-handle',
    };
    
    // Handle when the progress slider starts the change
    self.progress.start = function(jqEvent, ui) {
      // If the event is null, that means it was fired off programmatically
      if (jqEvent != null) {
        self.progress.isDragging = true;
      }
    }
    
    // Handle when the progress slider stops
    self.progress.stop = function(jqEvent, ui) {
      self.progress.isDragging = false;
      
      // Figure out where we should be
      var percent = ui.value;
      var position = self.currentlyPlaying.soundObj.durationEstimate * (percent / 100);
      
      // If the event is null, that means it was fired off programmatically  
      if (jqEvent != null) {
        self.currentlyPlaying.soundObj.setPosition(position);
      }
    };
    
    ///////////////////////////////////////////////////////////
    // Volume slider stuff
    
    // Volume defaults
    self.volume = {
      handle: '.volume-handle',
      startValue: 75,
    };
    
    // Handler when volume slider is moved
    self.volume.slide = function(jqEvent, ui) {
      self.currentlyPlaying.soundObj.setVolume(ui.value);
    }
    
    ///////////////////////////////////////////////////////////
    // Private functions
    
    function playlistHasSongs() {
      return (self.playlist.length > 0);
    }

    // Sets the percentage of the song that has been loaded
    function setLoadingProgress(percentage) {
      $('.loading', self.playerElement).css("width", percentage + "%");
    }
    
    // This goes through each of the items in the list and
    // sets up the sound for it
    var addPlaylistSongs = function() {
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
    
    // This hooks up all the button handlers, ie. play, stop, etc.
    var hookUpControls = function() {
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
      
      // Setup pause button
      $('.pause', self.playerElement).click(function() {
        if (!playlistHasSongs) { return; }
        self.currentlyPlaying.pause();
      });
      
      // Back button
      $('.back', self.playerElement).click(function() {
        self.goToPreviousSong();
      });
      
      // Next button
      $('.next', self.playerElement).click(function() {
        self.goToNextSong();
      });
    };
    
    // Sets up the two sliders on the player
    var setUpSliders = function() {
      setUpProgressSlider();
      setUpVolumeSlider();
    }
    
    // Sets up the progress slider and attaches handlers to the
    // slider handle
    var setUpProgressSlider = function() {
      // Get the element and get a handle on the slider
      var sliderElement = $('.progress', self.playerElement);
      var slider = sliderElement.slider(self.progress);
      
      self.progress.slider = slider;
    }
    
    var setUpVolumeSlider = function() {
      var volumeElement = $('.volume', self.playerElement);
      var volume = volumeElement.slider(self.volume);
      
      self.volume.slider = volume;
      
      self.currentlyPlaying.soundObj.setVolume(self.volume.startValue);
    };
    
    // Constructor, of sorts.
    var init = function() {
      addPlaylistSongs();
      setUpSliders();
      hookUpControls();
    }
    
    // Initalize!
    init();
  };
  
})(jQuery);
