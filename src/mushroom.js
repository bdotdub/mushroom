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
      self.soundObj.play();
      self.element.addClass('playing');
    };
    
    // Resume it
    this.resume = function() {
      self.soundObj.resume();
    };
    
    // Stop it
    this.stop = function() {
      self.element.removeClass('playing');
      self.soundObj.stop();
    }
    
    // Pause it
    this.pause = function() {
      self.soundObj.pause();
    }

    // Set volume
    this.setVolume = function(volume) {
      self.soundObj.setVolume(volume);
    }
    
    // Check if it's playing
    this.isPlaying = function() {
      // It is playing only if the playState == 1 and it is not paused
      return self.soundObj.playState == 1 && !self.soundObj.paused;
    }
    
    // Click handler
    this.click = function() {
      if (self.isPlaying()) {
        self.pause();
      }
      else if (self.soundObj.paused) {
        self.resume();
      }
      else {
        self.mushroom.play(self);
      }
      
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
    
    // This will be called from:
    //   1. Play button
    //   2. Back/Next Track
    //   3. Playlist song click
    this.play = function(spore) {
      // If there is a song currently playing, stop it
      if (self.currentlyPlaying != null) {
        self.currentlyPlaying.stop();
      }
      
      // If spore is passed in, use that to play
      if (spore != null) {
        self.currentlyPlaying = spore;
      }
      // If there is no current song for whatever reason,
      // pick the first one.
      else if (self.currentlyPlaying == null) {
        if (!playlistHasSongs) { return; }
        self.currentlyPlaying = self.playlist[0];
      }
      
      // Now check if it's already loaded. If so, we need to set the loaded bar
      // ahead
      if (self.currentlyPlaying.soundObj.bytesLoaded == self.currentlyPlaying.soundObj.bytesTotal) {
        setLoadingProgress(100);
      }
        
      // Set the volume to the current volume. Shouldn't be bad
      self.currentlyPlaying.setVolume(self.volume.getVolume());
      
      // Now, play it!
      self.currentlyPlaying.play();
    }
    
    // Sound object handlers
    this.goToNextSong = function() {
      var nextSpore = self.getSpore('NEXT');
      if (nextSpore != null) {
        self.play(nextSpore);
      }
    };
    
    this.goToPreviousSong = function() {
      var previousSpore = self.goSpore('BACK');
      if (previousSpore != null) {
        self.play(previousSpore);
      }
    };
    
    this.getSpore = function(direction) {
      var spore = (direction == 'BACK') ?
        self.currentlyPlaying.prevSong : self.currentlyPlaying.nextSong;

      // If it's the end or beginning and we repeat, we need to loop back around.
      // I can't help but feel this next block should be combined with the block
      // above this. anyway, who cares
      if (spore == null && self.options.repeat) {
        spore = (direction == 'BACK') ? self.playlist[self.playlist.length - 1] : self.playlist[0];
      }
      
      return spore;
    };
    
    ///////////////////////////////////////////////////////////
    // IoC endpoints
    
    // This is called whenever 
    this.songStopped = function() {
      self.progress.setProgress(0);
      setLoadingProgress(0);
    }
    
    this.loadingProgress = function() {
      var percentage = this.bytesLoaded * 100 / this.bytesTotal;
      setLoadingProgress(percentage);
    };
    
    this.playingProgress = function() {
      var currentPosition = (this.position * 100) / this.durationEstimate;
      
      // If the handle is not being dragged, the update it
      if (!self.progress.isDragging) {
        self.progress.setProgress(currentPosition);
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

    // Sets the loading handle position
    self.progress.setProgress = function(percentage) {
      self.progress.slider.slider("moveTo", percentage);
    };
    
    ///////////////////////////////////////////////////////////
    // Volume slider stuff
    
    // Volume defaults
    self.volume = {
      handle: '.volume-handle',
      startValue: 75,
      slider: null
    };
    
    // Handler when volume slider is moved
    self.volume.slide = function(jqEvent, ui) {
      self.currentlyPlaying.setVolume(ui.value);
    }

    // Accessor for volume
    self.volume.getVolume = function() { return self.volume.slider.slider('value'); }
    
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
        self.play();
      });
      
      // Next button
      $('.next', self.playerElement).click(function() {
        self.goToNextSong();
        self.play();
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
      
      self.currentlyPlaying.setVolume(self.volume.startValue);
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
