# node-red-contrib-jar-func

Node-RED node to run executable-jar file

Using the node, Node-RED users can run any JVM based code, such as Java, Kotlin, Scala programs.

<hr>

## How to setup the Java environment

(1) Download and install Java Development Kit

http://www.oracle.com/technetwork/java/javase/downloads/jdk10-downloads-4416644.html

(2) Set environment variables, JAVA_HOME and PATH to enable java and javac command

http://www.baeldung.com/java-home-on-windows-7-8-10-mac-os-x-linux

<hr>

## How to interact with the jar program

While this node is created, it will start running the specified jar program using the following command:
<br>
<code>java -jar {jar-file-name}</code>
<br>
The jar program can keep running without exiting.<br>
Any message arriving at the input of this node will be transmitted to the stdin of the jar program with JSON fromat, one line at a time.<br>
Each line of messages printed by the jar program's stdout will be tried to parse as JSON, if success, it will appear at the output of this node.

## Example Hello.java
``````

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Hello {

	public static void main(String[] args) {
		@SuppressWarnings("WeakerAccess")
		class Result {
			public String topic;
			public String payload;
		}

		BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));
		//noinspection InfiniteLoopStatement
		for (;;) {
			try {
				String line = stdin.readLine();
				JSONObject obj = JSON.parseObject(line);
				String payload = obj.get("payload").toString();

				Result result = new Result();
				result.topic = "Log";
				result.payload = "输入的payload=" + payload;	// this line contains Chinese characters.

				System.out.print("it works");	// the output will be parsed line by line,
				Thread.sleep(200);		// no matter timing.
				System.out.println(" fine!");	// this will be shown on node-red console but not to output
												// because it it not a valid JSON string.

				System.out.println(JSON.toJSONString(result,
						// with unicode, Chinese characters can be displayed correctly.
						SerializerFeature.BrowserCompatible		// BrowserCompatible ==> unicode encoding.
				));	// this message will appear at the output of this node.

				System.out.println("This is a Java program.");	// only to node-red console
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

}
``````
