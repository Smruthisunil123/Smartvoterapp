{ pkgs }: {
  packages = [
    pkgs.git
    pkgs.maven
    pkgs.openjdk17
    pkgs.doas-sudo-shim   # Add this line for sudo support
    pkgs.docker
    pkgs.doas
    pkgs.systemd
    pkgs.colima
  ];

  # Configure environment variables or services if needed
  env = { };
}
