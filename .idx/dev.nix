# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs }:

{
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = with pkgs; [
    nodejs_20
    zulu

    # Puppeteer / Chromium dependencies
    libx11
    libxcomposite
    libxcursor
    libxdamage
    libxfixes
    libxi
    libxrandr
    libxrender
    libxss
    libgobject
    alsa-lib
    nss
    fontconfig
    freetype
    glib
    gtk3
    pango
    cairo
    at-spi2-core
    at-spi2-atk
  ];

  # Environment variables
  env = { };

  # Firebase emulator config — optional for prod
  services.firebase = {
    emulators = {
      # Disabled since we’re using production backends
      detect = false;
      projectId = "demo-app";
      services = [ "auth" "firestore" ];
    };
  };

  # IDX workspace settings
  idx = {
    # VS Code / IDX extensions
    extensions = [
      # "vscodevim.vim"
    ];

    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };

    # Enable previews
    previews = {
      enable = true;
      configs = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
}
