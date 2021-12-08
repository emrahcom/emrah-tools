#!/bin/bash
set -e

# ------------------------------------------------------------------------------
# packages:
#   apt-get install imagemagick bc
#
# notes:
#   - graph is a chart modified by gimp
#   - graph should have the same resolution with the source video
#   - graph should be transparent
#   - inverted color may be better
#
#   - get NUMERATED_PIXELS from the graph. This is the active X axis length as
#     pixels.
#   - get SECONDS from the graph. This is the active X axis length as seconds.
#   - get XBASE from the graph. This is the pixel coordinate for X0.
#   - get Y0 from the graph. This is the pixel coordinate for box's top.
#   - get Y1 from the graph. This is the pixel coordinate for box's bottom.
#
# video:
#   DIVIDER=2 (-r 1/$DIVIDER)
#
#   ffmpeg -r 1/$DIVIDER -i frames/%06d.png -vcodec h264 -y timer.mp4
#   ffmpeg -i source.mp4 -r 1/$DIVIDER -i frames/%06d.png \
#       -filter_complex "overlay=0:0" -y graph-0.mp4
#   ffmpeg -i graph-0.mp4 -c copy -movflags faststart -y graph-1.mp4
# ------------------------------------------------------------------------------
mkdir -p frames
rm -f frames/*.png

GRAPH="graph.png"
SECONDS=7320
NUMERATED_PIXELS=1452
XBASE=398
Y0=30
Y1=994
PPS=$(bc <<< "scale=6; $NUMERATED_PIXELS/$SECONDS")
BGCOLOR="rgba(0, 0, 0, 0%)"
BOXCOLOR="rgb(255, 0, 0)"
BOXWIDTH=2

DIVIDER=2
SEQ_END=$(bc <<< "scale=0; $SECONDS/$DIVIDER")
for i in $(seq -f "%06g" 0 $SEQ_END); do
    X0=$(bc <<< "scale=4; $XBASE + $PPS*$i*$DIVIDER")
    X1=$(bc <<< "scale=4; $X0 + $BOXWIDTH")
    echo $i: $X0 - $X1

    convert $GRAPH -fill "$BOXCOLOR" -draw "rectangle $X0,$Y0 $X1,$Y1" \
        frames/$i.png
done
