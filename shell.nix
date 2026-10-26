{ pkgs ? import <nixpkgs> {} }:

# Angular 10 builds on node 22 (oldest node still in the nix binary cache). The build
# needs the legacy OpenSSL provider; that flag lives in the build:reborn npm script.
pkgs.mkShell {
  packages = with pkgs; [
    nodejs_22
    git
  ];

  shellHook = ''
    echo "ant-media-management-console dev shell"
    echo "  node: $(node --version)"
  '';
}
