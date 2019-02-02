server {
    listen 80;
    listen [::]:80;

    server_name mohiohio.com www.mohiohio.com;

    #required for certbot renew
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
    }

    location / {
        return 301 https://www.mohiohio.com$request_uri;
    }
}

server {
    server_name www.mohiohio.com;
    root /var/www/avd/current/dist;

    listen [::]:443 ssl http2 ipv6only=on;
    listen 443 ssl http2;
    charset utf-8;

    ssl_certificate /etc/letsencrypt/live/www.mohiohio.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/www.mohiohio.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    location / {
        return 301 https://www.djavd.com$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /index.html {
        add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    	expires off;
    }

    location /api {
      rewrite /api/(.*) /$1 break;
      proxy_pass http://127.0.0.1:1235;
      proxy_redirect off;
      proxy_buffering off;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}