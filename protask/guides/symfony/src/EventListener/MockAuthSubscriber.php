<?php
namespace App\EventListener;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
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

        if (in_array($path, ['/api/auth/register', '/api/auth/login', '/api/_reset'], true)) {
            return;
        }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer token-')) {
            throw new AccessDeniedHttpException('Token manquant ou invalide.');
        }
        $userId = (int) substr($auth, strlen('Bearer token-'));
        if ($userId <= 0) {
            throw new AccessDeniedHttpException('Token invalide.');
        }
        $request->attributes->set('_user_id', $userId);
    }
}
