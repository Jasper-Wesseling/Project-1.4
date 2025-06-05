<?php
namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class JWTLoginListener
{
    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event)
    {
        $user = $event->getUser();

        if (method_exists($user, 'isDisabled') && $user->isDisabled()) {
            $data = [
            'error' => 'User account is disabled',
            ];
            $event->setData($data);
            return;
        }
        $data = $event->getData();
        $data['message'] = 'Authentication successful';
        $event->setData($data);
    }
}