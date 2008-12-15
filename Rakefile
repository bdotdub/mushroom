require 'ftools'

desc "Compress and copy"
task :default => [:copy, :compress]

desc "Create the build directory"
task :makebuilddir do
  if not File.exists? 'build'
    Dir.mkdir 'build'
  end
end

desc "Copy the mushroom file"
task :copy => [:makebuilddir] do
  File.copy 'src/mushroom.js', 'build/mushroom.js'
end

desc "Compresses the mushroom js file"
task :compress => [:makebuilddir] do
  sh "java -jar etc/yuicompressor/yuicompressor.jar -o build/mushroom.min.js src/mushroom.js"
end