
# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_cache_server = "172.23.238.253"


# Detect the current OS. node on windows needs some symlink magic to work.
module OS
  def OS.windows?
    (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil
  end
end

Vagrant.configure(2) do |config|

  config.vm.box = "stackroute/barebones-node"
  config.vm.box_url = "http://#{vagrant_cache_server}/vagrant/boxes/stackroute-barebones-node.box"
  config.vm.hostname = 'stackroute-node'

  # Map the guest os port 8080 to host os port 8080
  config.vm.network "forwarded_port", guest: 3000, host: 3040
  config.vm.network "forwarded_port", guest: 6379, host: 6379

  if OS.windows?

    # enable symlinks between the host/gust filesystems
    config.vm.provider "virtualbox" do |vb|
      vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
    end

    # Setup the softlinks
    config.vm.provision :puppet do |puppet|
      puppet.manifest_file = "windows.pp"
    end

  end
end
