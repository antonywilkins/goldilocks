# Goldilocks

Goldilocks is a number of things:

  - A fully featured application (an appointments booking system, configured and styled for a hair salon)
  - A demonstration of a well integrated modern software stack for Java and HTML5 applications
  - A set of extension frameworks and components for Spring and AngularJS

### Version
0

### Tech

Goldilocks uses a number of open source projects to work properly:

* [AngularJS] - HTML enhanced for web apps!
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [jQuery] - duh

And of course Goldilocks itself is open source with a [public repository][github-repo-web]
 on GitHub.

### Installation
```sh
$ git clone https://github.com/antonywilkins/goldilocks.git goldilocks
$ cd goldilocks/goldilocks-build
$ mvn clean install
$ cd ../goldilocks-app-env-dev
$ java -Dloader.path=./src/main/resources,lib/ -classpath ./src/main/resources:./target/goldilocks-app-env-dev-0.1.0.jar org.springframework.boot.loader.PropertiesLauncher
$ 
```


### Development

Very much in a state of unfinished-ness. 

### Todos

 - Document!

License
----

MIT


**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does it's job)


   [github-repo-web]: <https://github.com/antonywilkins/goldilocks/>
   [git-repo-url]: <https://github.com/antonywilkins/goldilocks.git>
   
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [AngularJS]: <http://angularjs.org>


