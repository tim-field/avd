server {
    listen 80;
    listen [::]:80;

    server_name djavd.com www.djavd.com;

    #required for certbot renew
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
    }

    location / {
        return 301 https://www.djavd.com$request_uri;
    }
}

server {
    server_name www.djavd.com;
    root /var/www/avd/current/dist;

    charset utf-8;
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot

    ssl_certificate /etc/letsencrypt/live/www.djavd.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/www.djavd.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


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