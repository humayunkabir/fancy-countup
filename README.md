# create-fancy-plugin

1. Clone **`create-fancy-plugin`** and rename it with your plugin name.
    ```
    git clone git@github.com:humayunkabir/create-fancy-plugin.git PLUGIN_NAME
    ```
    or
    ```
    git clone https://github.com/humayunkabir/create-fancy-plugin.git PLUGIN_NAME
    ```
2.  Enter into your plugin folder.
    ```
    cd PLUGIN_NAME
    ```
3. Change your remote's URL from **SSH** or **HTTPS** with the `git remote set-url` command.
    ```
    git remote set-url origin git@github.com:USERNAME/PLUGIN_NAME.git
    ```
    or
    ```
    git remote set-url origin https://github.com/USERNAME/PLUGIN_NAME.git
    ```
    Verify that the remote URL has changed.
    ```
    git remote -v
    ```
4. Download dependencies 
    ```
    npm i
    ```
5. To start
    ```
    gulp
    ```
    or
    ```
    npm start
    ```
6. Change the reference of `create-fancy-plugin` with your plugin name and the `url`s in `package.json` file.
7. To build `dist` run:
    ```
    gulp dist
    ```
    or
    ```
    npm run build
    ```

Changing a remote's URL: [https://help.github.com/en/articles/changing-a-remotes-url](https://help.github.com/en/articles/changing-a-remotes-url)


Please report bugs and contribute at github.
- [Repository](https://github.com/humayunkabir/create-fancy-plugin)
- [Issues](https://github.com/humayunkabir/create-fancy-plugin/issues)
- [Projects](https://github.com/humayunkabir/create-fancy-plugin/projects)
