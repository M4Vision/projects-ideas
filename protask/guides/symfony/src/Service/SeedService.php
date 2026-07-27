<?php
namespace App\Service;
use App\Entity\{Board, Card, Comment, Invitation, Label, ProjectColumn, User};
use Doctrine\ORM\EntityManagerInterface;

class SeedService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function load(): void
    {
        $alex = (new User())->setName('Alexandre')->setEmail('alex@protask.dev')->setPassword('pass123');
        $sophie = (new User())->setName('Sophie')->setEmail('sophie@protask.dev')->setPassword('pass123');
        $marc = (new User())->setName('Marc')->setEmail('marc@protask.dev')->setPassword('pass123');
        foreach ([$alex, $sophie, $marc] as $u) { $this->em->persist($u); }
        $this->em->flush();

        // Board 1: Design System
        $b1 = (new Board())->setTitle('Design System')->setOwner($alex)
            ->setDescription("Design system de l'application")->setColor('#8B5CF6')
            ->setCategories(['Design', 'UI/UX'])->setMemberIds([$sophie->getId(), $marc->getId()]);
        $this->em->persist($b1);

        $cols = [];
        foreach ([['Backlog',0,'#6B7280','Tâches en attente'],['En cours',1,'#3B82F6','Tâches en cours'],['Terminé',2,'#10B981','Tâches terminées']] as [$t,$o,$c,$d]) {
            $col = (new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b1)->setColor($c)->setDescription($d);
            $this->em->persist($col); $cols[] = $col;
        }

        foreach ([['Design','#8B5CF6','Design'],['Dev','#3B82F6','Dev'],['Documentation','#10B981','Doc'],['Urgent','#EF4444','Urgent']] as [$n,$c,$desc]) {
            $this->em->persist((new Label())->setName($n)->setColor($c)->setBoard($b1)->setDescription($desc));
        }
        $this->em->flush();

        $cards = [];
        foreach ([
            ['Définir la palette','Choisir les couleurs.',0,$cols[0],'2025-04-15',$alex,[1]],
            ['Composants UI','Créer les composants.',1,$cols[0],'2025-04-20',$sophie,[1,2]],
            ['Page accueil responsive','Terminer la mise en page.',0,$cols[1],'2025-04-10',$alex,[2]],
            ['Documentation','Écrire la documentation.',1,$cols[2],'2025-04-05',$sophie,[3]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $c = (new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l);
            $this->em->persist($c); $cards[] = $c;
        }
        $this->em->flush();

        $this->em->persist((new Comment())->setText("J'ai commencé la palette.")->setAuthor($alex)->setCard($cards[0]));
        $this->em->persist((new Comment())->setText('Je valide le violet.')->setAuthor($sophie)->setCard($cards[0]));
        $this->em->persist((new Comment())->setText('PR créé.')->setAuthor($alex)->setCard($cards[2]));
        $this->em->persist((new Invitation())->setBoard($b1)->setEmail('marc@protask.dev')->setInvitedBy($alex)->setStatus('accepted'));
        $this->em->persist((new Invitation())->setBoard($b1)->setEmail('julie@test.com')->setInvitedBy($alex)->setStatus('pending'));

        // Board 2: Refonte App Mobile
        $b2 = (new Board())->setTitle('Refonte App Mobile')->setOwner($alex)
            ->setDescription("Refonte complète de l'application mobile")->setColor('#3B82F6')
            ->setCategories(['Mobile'])->setMemberIds([]);
        $this->em->persist($b2);
        $cols2 = [];
        foreach ([['À faire',0,'#F59E0B','Planifiées'],['En cours',1,'#3B82F6',''],['Terminé',2,'#10B981','']] as [$t,$o,$c,$d]) {
            $col = (new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b2)->setColor($c)->setDescription($d);
            $this->em->persist($col); $cols2[] = $col;
        }
        foreach ([
            ['Wireframes','Wireframes validés.',0,$cols2[0],'2025-04-08',$alex,[2]],
            ['Maquette Figma','Maquette haute fidélité.',0,$cols2[1],'2025-04-18',$alex,[1]],
            ['Tests utilisateurs','Sessions de test.',0,$cols2[2],'2025-04-12',$sophie,[3]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $this->em->persist((new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l));
        }

        // Board 3: Marketing Q2
        $b3 = (new Board())->setTitle('Marketing Q2')->setOwner($sophie)
            ->setDescription('Stratégie marketing pour le Q2')->setColor('#EF4444')
            ->setCategories(['Marketing'])->setMemberIds([$marc->getId()]);
        $this->em->persist($b3);
        foreach ([['Idées',0,'#8B5CF6','Idées à explorer'],['En production',1,'#EF4444','Campagnes en cours']] as [$t,$o,$c,$d]) {
            $this->em->persist((new ProjectColumn())->setTitle($t)->setOrder($o)->setBoard($b3)->setColor($c)->setDescription($d));
        }
        $this->em->flush();

        $cols3 = $this->em->getRepository(ProjectColumn::class)->findBy(['board' => $b3], ['order' => 'ASC']);
        foreach ([
            ['Analyse concurrents','Benchmark',0,$cols3[0],'2025-04-14',$alex,[2]],
            ['Stratégie contenu','Calendrier éditorial.',1,$cols3[0],'2025-04-22',$sophie,[1,4]],
            ['Campagne emailing',"Séquence d'emails.",0,$cols3[1],'2025-04-25',$alex,[4]],
        ] as [$t,$d,$o,$col,$dd,$a,$l]) {
            $this->em->persist((new Card())->setTitle($t)->setDescription($d)->setOrder($o)->setColumn($col)
                ->setDueDate(new \DateTime($dd))->setAssignee($a)->setLabelIds($l));
        }
        $this->em->flush();
    }
}
