This approach that uses ngrok is no longer used. It is inconvenient because, because every time my local machine restarts, I have to run a new ngrok server, provide the cooresponding new ngrok forwarding URL to an admin; that admin has to add the forwarding URL to a list of legitimate URLs. ngrok does provide a way to ensure an unchanging URL, but this costs money.

The approach of modifying the Windows `hosts` file to achieve the redirect allows for an unchanging URL, so that is what we use instead. The Windows `hosts` file approach is described in `README.md`.

Anyhow, here is how the ngrok approach works.

#Forwarding to localhost with ngrok

Since the Angular app uses OAuth, it is necessary to provide the URL that will point to the Angular webserver to the OAuth API. Obviously it won't work to send "localhost:<port>" to the OAuth API. (The OAuth API is decoupled from whatever machine the webserver runs on, so there is no shared notion of locality. Even if they weren't decoupled, this would be invalid syntax).

Is it even possible to obtain a global URL that points to a locally hosted webserver? It turns out that if we use ngrok, it is. ngrok is a command line tool that provides a globally available URL that forwards to a locally running webserver.

To install ngrok on Windows:

Follow step 2 of this installation guide and install the Chocolatey package manager. Use the "Individual" installation. This will involve typing commands in an instance of Windows PowerShell that has admin privileges.
Open the regular Windows command prompt and execute choco install ngrok.
In your browser, go to the ngrok website and create an ngrok account.
In the Windows command prompt, execute ngrok config add-authtoken <token>, as is suggested on the home page of your ngrok account.
After installing ngrok, here is how you obtain the global URL that forwards to localhost:

Start the Angular webserver with ng serve --disableHostCheck true.
Assuming that <port> is the port on which the Angular webserver runs, execute ngrok http <port> --host-header="localhost:<port>". This command may take a while to execute. After it does, the global URL is the one to the left of the -> in the row of text labeled by "Forwarding".
