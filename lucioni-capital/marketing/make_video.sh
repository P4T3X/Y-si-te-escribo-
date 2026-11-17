#!/bin/bash
# Arma el teaser vertical (1080x1920, 30 fps) con acercamiento suave en cada escena y fundidos entre ellas.
set -e
cd "$(dirname "$0")/out"
D=(2.6 3.4 3.2 3.4 3.0 3.4); N=${#D[@]}
for i in $(seq 1 $N); do d=${D[$((i-1))]}; fr=$(python3 -c "print(int($d*30))")
  ffmpeg -v error -y -i escena-$i.png -vf "scale=1188:2112,zoompan=z='1+0.06*on/$fr':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$fr:s=1080x1920:fps=30,format=yuv420p" -r 30 clip-$i.mp4
done
in="";for i in $(seq 1 $N);do in="$in -i clip-$i.mp4";done
f="";prev="[0:v]";acc=${D[0]}
for i in $(seq 1 $((N-1)));do off=$(python3 -c "print(round($acc-0.35*$i,3))");f="$f$prev[$i:v]xfade=transition=fade:duration=0.35:offset=$off[v$i];";prev="[v$i]";acc=$(python3 -c "print($acc+${D[$i]})");done
ffmpeg -v error -y $in -filter_complex "${f%;}" -map "$prev" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart lucioni-teaser-vertical.mp4
ls -la lucioni-teaser-vertical.mp4
