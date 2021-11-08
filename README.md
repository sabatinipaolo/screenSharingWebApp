# sharingscreenwebapp

Semplice servizio di condivisione dello schermo da usare in rete locale via web ...

Gli utenti del laboratio si collegano ad una pagina servita da un server web ( in questo caso realizzato con nodejs )

Sono presenti due bottoni. Uno per condividere lo schermo ( una finestra) uno per interrompere la condivisione.

# installazione dei prerequisiti
## su knoppix 
installazione nodejs
```console
knoppix@Microknoppix:~$ sudo apt update
knoppix@Microknoppix:~$ sudo apt install nodejs npm
```

installazione npm 
nodejs (non presente in knoppix)  

# creazione del certificato ```cert.pem``` e della chiave ```key.pem``` 

seguire qui : https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/
TODO: 


# Installazione dell'app su Gnu/Linux :


```console
foo@bar:~$ git clone https://gitlab.com/paolo.sabatini/sharingscreenwebapp.git
foo@bar:~$ cd sharingscreenwebapp/app/ 
foo@bar:~/sharingscreenwebapp/app$ npm install 

```
copiare nella directory ```app ``` le chiavi  two files, ```cert.pem``` (the certificate) and ```key.pem``` (the private key) creati al punto precedente.

# eseguire l'app 

```console

foo@bar:~/sharingscreenwebapp/app$ nodejs sigServ.js 

```




TODO: continuare...





# approfondimenti 

https://webrtc.github.io/webrtc-org/start/
