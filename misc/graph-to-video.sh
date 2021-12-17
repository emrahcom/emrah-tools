#!/bin/bash
set -e

# ------------------------------------------------------------------------------
# required packages:
#   apt-get install imagemagick bc
#
# notes:
#   - graph is a chart prepared by LibreOffice Calc using data
#     - remove the advertisement periods. keep the initial 2 mins.
#     - copy the last minute data to the initial minute of advertisement
#   - graph is captured by scrot while zooming (ctrl+shift+j) in Calc
#   - graph is a chart modified by GIMP
#     - it should have the same resolution with the source video (ex. 1920x1080)
#     - glue the advertisement edges. remove the second minute of advertisement
#     - graph should be transparent
#     - inverted color may be better
#
#   - X0 is the pixel coordinate for starting point on X axis
#   - X1 is the pixel coordinate for ending point on X axis
#   - Y0 is the pixel coordinate for top point of the slider on Y axis
#   - Y1 is the pixel coordinate for bottom point of the slider on Y axis
#   - SECONDS is the X axis length of the active part [X0, X1] as seconds
#   - FRAMERATE is the number of frames per second (default 0.5)
#
# video:
#   ffmpeg -r $FRAMERATE -i frames/%06d.png -vcodec h264 -y timer.mp4
#   ffmpeg -i source.mp4 -r $FRAMERATE -i frames/%06d.png \
#       -filter_complex "overlay=0:0" -y graph-0.mp4
#   ffmpeg -i graph-0.mp4 -c copy -movflags faststart -y graph-1.mp4
#
# upload:
#   manually clear the remote folder before uploading
#
#   mkdir split
#   cd split
#   split -b 10M ../graph-1.mp4
#   rsync -ave "ssh -p 22" ../split/ remote-host:/mnt/store/project-name/split/
#
# on remote:
#   cd /mnt/store/project-name
#   cat split/* >graph-1.mp4
#   md5sum graph-1.mp4
# ------------------------------------------------------------------------------
mkdir -p frames
rm -f frames/*.png

GRAPH="graph.png"
X0=398
X1=1850
Y0=30
Y1=994
SECONDS=7320
FRAMERATE=0.5
NUMERATED_PIXELS=$(bc <<< "$X1 - $X0")
PPS=$(bc <<< "scale=6; $NUMERATED_PIXELS/$SECONDS")
BGCOLOR="rgba(0, 0, 0, 0%)"
BOXCOLOR="rgb(255, 0, 0)"
BOXWIDTH=2

SEQ_END=$(bc <<< "scale=0; $SECONDS*$FRAMERATE")
for i in $(seq -f "%06g" 0 $SEQ_END); do
    x0=$(bc <<< "scale=4; $X0 + $PPS*$i/$FRAMERATE")
    x1=$(bc <<< "scale=4; $x0 + $BOXWIDTH")
    echo $i: $x0 - $x1

    convert $GRAPH -fill "$BOXCOLOR" -draw "rectangle $x0,$Y0 $x1,$Y1" \
        frames/$i.png
done
