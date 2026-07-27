<?php
namespace App\EventListener;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MockAuthSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 10]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if (in_array($path, ['/api/auth/register', '/api/auth/login', '/api/auth/logout', '/api/_reset'], true)) {
            return;
        }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer token-')) {
            $event->setResponse(new JsonResponse(['error' => 'Token manquant ou invalide.'], 401));
            return;
        }
        $userId = (int) substr($auth, strlen('Bearer token-'));
        if ($userId <= 0) {
            $event->setResponse(new JsonResponse(['error' => 'Token invalide.'], 401));
            return;
        }
        $request->attributes->set('_user_id', $userId);
    }
}
