server {
    listen 80;
    listen [::]:80;

    server_name mohiohio.com www.mohiohio.com;
    root /var/www/avd/current/dist;

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