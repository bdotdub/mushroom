# Mushroom

A jQuery music player that let's you do everything you can with a flash music player,
but controlled through javascript. Thus, allowing freedom to skin the player
through HTML/CSS. It is built on top of
[SoundManager2](http://www.schillmania.com/projects/soundmanager2/)
by [Scott Schiller](http://www.schillmania.com/).

## Dependencies

NOTE: All the dependencies are included the project tree.

1. [jQuery](http://jquery.com/)
1. [jQuery UI](http://ui.jquery.com/)
1. [SoundManager2](http://www.schillmania.com/projects/soundmanager2/)

## Getting started

1. First we must include SoundManager2:

    <script src="/path/to/soundmanager2.js" type="text/javascript"></script>

If the SoundManager2 swf file is in another directory, you have so include code
to point SoundManager2 in the right direction (more documentation
[here](http://www.schillmania.com/projects/soundmanager2/doc/#sm-config):

    <script type="text/javascript">
      soundManager.url = '/path/to/swf/'
    </script>

1. Include the jQuery libraries

    <script src="/path/to/jquery.js" type="text/javascript"></script>
    <script src="/path/to/jquery.ui.js" type="text/javascript"></script>

1. Inside your HTML page, you need a certain structure for you player. An example
is provided in `examples/`

_INCOMPLETE_

Coming soon.

## Info

This library is released under the [GPLv3](http://www.gnu.org/licenses/gpl-3.0.txt)
license.

### Contributors

* [Benny Wong](http://github.com/bdotdub/)


