cp helena.html ~/helena.arur.site/public/index.html

foreach i (Alquist Busman Fabry Gall Hallemeier Helenabot Marius Nana Primus Radius Robot1 Robot2)
  set low = `echo $i | tr '[A-Z]' '[a-z]'`
  sed s/Helena/$i/ helena.html | sed s/helena/$low/ >! $low.html
  cp $low.html ~/$low.arur.site/public/index.html
  cp sprites/$low.png ~/$low.arur.site/public
end
