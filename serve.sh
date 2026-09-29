#!/usr/bin/env bash
# VAUNT ATELIER - Local Preview Server Launcher

PORT=3000
echo "=========================================================="
echo " Starting VAUNT ATELIER Preview Server on Port $PORT"
echo "=========================================================="

if command -v python3 &>/dev/null; then
  echo "Using Python 3 HTTP Server..."
  python3 -m http.server $PORT
elif command -v npx &>/dev/null; then
  echo "Using npx serve..."
  npx serve . -p $PORT
elif command -v perl &>/dev/null; then
  echo "Using Perl Micro-Server on http://localhost:$PORT ..."
  perl -MIO::Socket::INET -e '
    my $port = '$PORT';
    my $server = IO::Socket::INET->new(Listen => 10, LocalPort => $port, Reuse => 1, Proto => "tcp")
      or die "Cannot bind to port $port: $!\n";
    print "Open your browser at: http://localhost:$port\n";
    while (my $client = $server->accept()) {
      my $req = <$client>;
      if ($req =~ /^GET \/([^\s\?]*)(\?[^\s]*)? HTTP/) {
        my $path = $1 || "index.html";
        $path =~ s/\.\.//g; # basic sanitization
        if (-f $path) {
          my $ctype = "text/plain";
          $ctype = "text/html" if $path =~ /\.html$/;
          $ctype = "text/css" if $path =~ /\.css$/;
          $ctype = "application/javascript" if $path =~ /\.js$/;
          $ctype = "application/json" if $path =~ /\.json$/;
          $ctype = "image/svg+xml" if $path =~ /\.svg$/;
          open my $f, "<", $path;
          my $body = do { local $/; <$f> };
          close $f;
          my $len = length($body);
          print $client "HTTP/1.1 200 OK\r\nContent-Type: $ctype\r\nContent-Length: $len\r\nConnection: close\r\n\r\n$body";
        } else {
          print $client "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\n\r\nNot Found";
        }
      }
      close $client;
    }
  '
else
  echo "Opening index.html directly..."
  open index.html
fi
