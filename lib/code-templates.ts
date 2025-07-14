export const languageTemplates: { [key: string]: string } = {
  javascript: `console.log("Hello, World!");`,
  python: `print("Hello, World!")`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  rust: `fn main() {
    println!("Hello, World!");
}`,
  java: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}`,
};
