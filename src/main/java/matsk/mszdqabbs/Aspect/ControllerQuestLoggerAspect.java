package matsk.mszdqabbs.Aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@Aspect
@Slf4j
public class ControllerQuestLoggerAspect {

    /**
     * 对所有Controller层方法添加横切点
     */
    @Pointcut("execution(* matsk.mszdqabbs.Controller..*(..))")
    private void needToLog(){}

    @Around("needToLog()")
    public Object beforeControllerInvocation(ProceedingJoinPoint jp) {
        log.info("================Controller Request(" + jp.getSignature() + ") Start================");
        log.info(jp.getSignature() + "invoking with arguments:" + Arrays.toString(jp.getArgs()));
        long startTimestamp = System.currentTimeMillis();
        try {
            return jp.proceed();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            log.info(jp.getSignature() + "throw a exception:" + throwable.getMessage());
            log.info(jp.getSignature() + "exit unexpectedly.");
        } finally {
            log.info(jp.getSignature() + "execution duration:" + (System.currentTimeMillis() - startTimestamp));
            log.info("================Controller Request (" + jp.getSignature() + ") End================");
        }
        return null;
    }
}
