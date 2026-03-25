{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    lexmachina = {
      url = "git+ssh://git@github.com/TalhaAzim/lexmachina";
      # Or use HTTPS if preferred:
      # url = "github:TalhaAzim/lexmachina";
    };
  };

  outputs = { self, nixpkgs, flake-utils, lexmachina }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Get the node devshell from lexmachina
        nodeShell = lexmachina.devShells.${system}.node or null;
        
        # Extend the node devshell with project-specific packages
        projectPackages = with pkgs; [
          nodejs_20
          yarn
          nodePackages.pnpm
          # Add project-specific tools here
          nodePackages.typescript
          nodePackages.typescript-language-server
          nodePackages.prettier
          nodePackages.eslint
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          name = "project-node-devshell";
          
          # Merge packages from lexmachina node shell if available
          packages = if nodeShell != null 
            then nodeShell.buildInputs ++ projectPackages
            else projectPackages;
          
          shellHook = ''
            echo "🚀 Vite Development Shell"
            echo "Node version: $(node --version)"
            echo ""
            if [ ! -d "node_modules" ]; then
              echo "📦 Installing dependencies..."
              npm install
            fi
            echo "🚀 Run 'npm run dev' to start the development server"
            echo ""
            ${if nodeShell != null then nodeShell.shellHook else ""}
          '';
          
          # Inherit environment variables from lexmachina if needed
          env = if nodeShell != null then nodeShell.env or {} else {};
        };
        
        # Also expose the extended node shell explicitly
        devShells.node = self.devShells.default;
      });
}
