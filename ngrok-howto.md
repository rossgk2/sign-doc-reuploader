This approach that uses ngrok is no longer used. It is inconvenient because every time my local machine restarts, I have to run a new ngrok server, provide the cooresponding new ngrok forwarding URL to an admin, and that admin has to add the forwarding URL to a list of legitimate URLs.

The approach of modifying the Windows `hosts` file to achieve the redirect allows for an unchanging URL, so that is what we use instead. (ngrok does provide a way to ensure an unchanging URL, but it costs money). The Windows `hosts` file approach is described in `README.md`.

Anyhow, here is how the ngrok approach works.

# Forwarding to localhost with ngrok

Since the Angular app uses OAuth, it is necessary to provide the URL that will point to the Angular webserver to the OAuth API. Obviously it won't work to send "localhost:<port>" to the OAuth API. (The OAuth API is decoupled from whatever machine the webserver runs on, so there is no shared notion of locality. Even if they weren't decoupled, this would be invalid syntax).

Is it even possible to obtain a global URL that points to a locally hosted webserver? It turns out that if we use ngrok, it is. ngrok is a command line tool that provides a globally available URL that forwards to a locally running webserver.

To install ngrok on Windows:

1. Follow step 2 of this installation guide and install the Chocolatey package manager. Use the "Individual" installation. This will involve typing commands in an instance of Windows PowerShell that has admin privileges.
2. Open the regular Windows command prompt and execute `choco install ngrok`.
3. In your browser, go to the ngrok website and create an ngrok account.
4. In the Windows command prompt, execute `ngrok config add-authtoken <token>`, as is suggested on the home page of your ngrok account.

After installing ngrok, here is how you obtain the global URL that forwards to localhost:
1. Start the Angular webserver with `ng serve --disableHostCheck true`. (We use `disableHostCheck` to allow traffic outside the local machine, i.e., traffic from the ngrok-generated URL).
2. Assuming that `<port>` is the port on which the Angular webserver runs, execute `ngrok http <port> --host-header="localhost:<port>"`. This command may take a while to execute. After it does, the global URL is the one to the left of the -> in the row of text labeled by "Forwarding".

# Summarized download and install instructions for running Angular app with ngrok 

1. [Download](https://github.com/rossgk2/sign-doc-reuploader/archive/refs/heads/main.zip) the zip of this repo and extract it.
2. Rename the extracted folder to something (e.g. `fldr`).
3. In a command prompt `cd` to `fldr/sign-template-reuploader`.
4. (Possibly not necessary). If running for the first time, execute `npm install`.
5. Execute `ng serve --disableHostCheck true`. 
6. In another command prompt, `ngrok http <port> --host-header="localhost:<port>"`.
7. Navigate to the ngrok forwarding URL in your web browser.
