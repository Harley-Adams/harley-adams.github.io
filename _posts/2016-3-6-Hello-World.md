---
layout: post
title: Hello World
---
This blog entry is to test out code snippets, and to teach you how to code hello world!

{% highlight csharp linenos %}

public class Hello
{
   public static void Main()
   {
      System.Console.WriteLine("Hello World!");
   }
}
{% endhighlight %}

Console applications always start from the Main method, which needs to be static and needs to not have a return type.
The secret here is that it actually does return an int, but is only used by the OS to figure out if our program has run successfully (0) or not (1 or larger).